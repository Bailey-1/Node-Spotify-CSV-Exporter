let search;
let accessToken;
let refreshToken;

let data;
let currentTrack = 0;
let totalTracks = 0;

let songArray = [['Number', 'Name', 'Artist', 'Album']]; // Define first row of 2D array

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
			// console.log('[response]: ', response);
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
				getSavedTracks(data.next);
			}
		})
		.catch((error) => {
			console.log(error);
		});
}

function generateTableRecords(item) {
	const template = document.querySelector('#tableRecord');
	const clone = document.importNode(template.content, true);
	clone.querySelector('#number').textContent = totalTracks - currentTrack;
	clone.querySelector('#name').textContent = item.track.name;
	clone.querySelector('#artist').textContent = item.track.artists[0].name;
	clone.querySelector('#album').textContent = item.track.album.name;

	document.querySelector('#tableBody').appendChild(clone);

	let trackArr = [];
	trackArr.push(totalTracks - currentTrack); // Track Num
	trackArr.push(item.track.name); // Track Name
	trackArr.push(item.track.artists[0].name); // Artist Name
	trackArr.push(item.track.album.name); // Artist Name

	songArray.push(trackArr);

	currentTrack++;
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

	search = location.hash.slice(1).split('&');
	accessToken = search[0].slice(13); // cut off beginning of string array element
	refreshToken = search[1].slice(14);
	console.log('access ', accessToken);
	console.log('refresh ', refreshToken);

	refreshCurrent();
}

window.addEventListener('load', init);
