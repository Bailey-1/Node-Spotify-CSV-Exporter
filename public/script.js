/* 
	TODO: 
	- allow users to select data to save to the CSV.
	- Display infomation about the User e.g. profile pic, username, account age etc
	- Allow users to paste in links for playlists - including private ones and offer the same features.
	- Save access & refresh token to session storage and remove it from the hash
*/

let search;
let accessToken;
let refreshToken;

let data;
let currentTrack = 0;
let totalTracks = 0;

let totalSeconds = 0;

let songArray = [
	['Number', 'Name', 'Artist', 'Album', 'Duration', 'Added On', 'ID'],
]; // Define first row of 2D array

async function getSavedTracks(
	url = 'https://api.spotify.com/v1/me/tracks?limit=50',
) {
	await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + accessToken,
		},
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else if (response.status === 401) {
				console.log(
					'response status is 401. Which means access token is too old.',
				);
				refreshAccessToken();
			} else {
				throw new Error('Something went wrong');
			}
		})
		.then((responseJson) => {
			// Do something with the response
			console.log('[responseJson]: ', responseJson);
			data = responseJson;
			totalTracks = data.total;
			data.items.forEach(generateTableRecords);
			if (data.next) {
				// getSavedTracks(data.next); // TEMP COMMENT OUT TO REDUCE API CALLS
			}
			createStats();
		})
		.catch((error) => {
			console.log(error);
		});
}

function generateTableRecords(item) {
	const template = document.querySelector('#tableRecord');
	const clone = document.importNode(template.content, true);
	clone.querySelector('#id').textContent = item.track.id;
	clone.querySelector('#number').textContent = totalTracks - currentTrack;
	clone.querySelector('#name').textContent = item.track.name;

	let artists = [];

	item.track.artists.map((artist) => {
		artists.push(artist.name);
	});

	clone.querySelector('#artist').textContent = artists.slice(0, 5).join(', ');
	clone.querySelector('#album').textContent = item.track.album.name;

	const total = Math.ceil(item.track.duration_ms / 1000);

	totalSeconds += total;

	let minutes = String(Math.floor(total / 60));
	minutes = minutes.padStart(2, '0');
	let seconds = String(total % 60);
	seconds = seconds.padStart(2, '0');
	clone.querySelector('#duration').textContent = `${minutes}:${seconds}`;

	const addedAtDate = new Date(item.added_at).toLocaleString('en-GB');
	clone.querySelector('#added').textContent = addedAtDate;

	clone.querySelector('#btnPlay').addEventListener('click', () => {
		playDemo(item.track.preview_url);
	});

	clone.querySelector('#btnStop').addEventListener('click', () => {
		stopDemo();
	});

	document.querySelector('#tableBody').appendChild(clone);

	// Add info to Array
	let trackArr = [];
	trackArr.push(totalTracks - currentTrack); // Track Num
	trackArr.push(item.track.name); // Track Name
	trackArr.push(item.track.artists[0].name); // Artist Name
	trackArr.push(item.track.album.name); // Artist Name
	trackArr.push(`${minutes}:${seconds}`); // Song Duration
	trackArr.push(addedAtDate); // Song added at
	trackArr.push(item.track.id); // Track Num

	songArray.push(trackArr);

	currentTrack++;
}

function playDemo(preview_url) {
	const player = document.querySelector('#mainPlayer');
	if (preview_url) {
		player.src = preview_url;
	} else {
		alert('[ERROR]: Selected song has no available preview. ');
	}
	player.play();
}

function stopDemo() {
	const player = document.querySelector('#mainPlayer');
	player.pause();
}

function createStats() {
	let hours = String(Math.floor(totalSeconds / 60 / 60));
	hours = hours.padStart(2, '0');
	let minutes = String(Math.floor((totalSeconds / 60) % 60));
	minutes = minutes.padStart(2, '0');

	document.querySelector(
		'#totalTime',
	).textContent = `Total Duration: ${hours}:${minutes}`;

	document.querySelector(
		'#totalSaved',
	).textContent = `Number of Saved Tracks: ${totalTracks}`;
}

async function refreshCurrent() {
	await getSavedTracks();
}

async function refreshAccessToken() {
	console.log('[refreshAccessToken()]');
	const result = await fetch(`/refresh_token?refresh_token=${refreshToken}`);
	const data = await result.json();
	accessToken = data.access_token;
	refreshCurrent();
}

// CREDIT - https://stackoverflow.com/a/24922761/11213488
function exportToCsv(filename, rows) {
	var processRow = function (row) {
		var finalVal = '';
		for (var j = 0; j < row.length; j++) {
			var innerValue = row[j] === null ? '' : row[j].toString();
			if (row[j] instanceof Date) {
				innerValue = row[j].toLocaleString();
			}
			var result = innerValue.replace(/"/g, '""');
			if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
			if (j > 0) finalVal += ',';
			finalVal += result;
		}
		return finalVal + '\n';
	};

	var csvFile = '';
	for (var i = 0; i < rows.length; i++) {
		csvFile += processRow(rows[i]);
	}

	var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) {
		// IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		var link = document.createElement('a');
		if (link.download !== undefined) {
			// feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

async function init() {
	document.querySelector('#btnExport').addEventListener('click', function () {
		exportToCsv('tracklist.csv', songArray);
	});

	document
		.querySelector('#spotifyLogin')
		.addEventListener('click', function () {
			window.location.href = '/login';
		});

	search = location.hash.slice(1).split('&');
	accessToken = search[0].slice(13); // cut off beginning of string array element
	refreshToken = search[1].slice(14);
	console.log('access ', accessToken);
	console.log('refresh ', refreshToken);

	refreshCurrent();
}

window.addEventListener('load', init);
