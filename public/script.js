import {
	removeContentFrom,
	exportToCsv,
	createStats,
	playDemo,
	stopDemo,
	fetchAPI,
} from './scripts/utility.js';
import { savedTabSelected, playlistTabSelected } from './scripts/options.js';
import { addPlaylistSelectOption } from './scripts/listPlaylist.js';

/* 
	TODO: 
	- allow users to select data to save to the CSV.
	- Create a footer and link it back to website, github and twitter etc
	- Add stats to the csv file at the top
*/

let el = {
	checkbox: {},
};

let currentTrack = 0;
let totalTracks = 0;

let totalSeconds = 0;

// Array for all of the different playlists available
let playlistObj = {
	total: 0,
	items: [],
};

let isPlaylist = false;

let songArray = [
	[
		'Number',
		'Name',
		'Artist',
		'Album',
		'Disc No.',
		'Track No.',
		'Duration',
		'Added On',
		'ID',
	],
]; // Define first row of 2D array

function resetTable() {
	removeContentFrom(document.querySelector('#tableBody'));
	currentTrack = 0;
	totalTracks = 0;
	songArray = [
		[
			'Number',
			'Name',
			'Artist',
			'Album',
			'Disc No.',
			'Track No.',
			'Duration',
			'Added On',
			'ID',
		],
	];
}

// Get all of the tracks from a track url.
async function getTracks(url) {
	const data = await fetchAPI(url);
	if (data) {
		totalTracks = data.total;
		data.items.forEach(generateTableRecords);
		if (data.next) {
			// getTracks(data.next); // TEMP COMMENT OUT TO REDUCE API CALLS
		}
		createStats(totalSeconds, totalTracks);
	}
}

function generateTableRecords(item) {
	const template = document.querySelector('#tableRecord');
	const clone = document.importNode(template.content, true);

	clone.querySelector('#id').textContent = item.track.id;

	const trackId = isPlaylist ? currentTrack + 1 : totalTracks - currentTrack;
	clone.querySelector('#number').textContent = trackId;
	clone.querySelector('#name').textContent = item.track.name;

	let artists = [];

	item.track.artists.map((artist) => {
		artists.push(artist.name);
	});

	clone.querySelector('#artist').textContent = artists.slice(0, 5).join(', ');
	clone.querySelector('#album').textContent = item.track.album.name;

	clone.querySelector('#diskNum').textContent = item.track.disc_number;
	clone.querySelector('#trackNum').textContent = item.track.track_number;

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
	trackArr.push(trackId); // Track Num
	trackArr.push(item.track.name); // Track Name
	trackArr.push(item.track.artists[0].name); // Artist Name
	trackArr.push(item.track.album.name); // Album Name
	trackArr.push(item.track.disc_number); // Disc Number
	trackArr.push(item.track.track_number); // Track Number
	trackArr.push(`${minutes}:${seconds}`); // Song Duration
	trackArr.push(addedAtDate); // Song added at
	trackArr.push(item.track.id); // Track Num

	songArray.push(trackArr);

	currentTrack++;
}

async function getAccountInfo() {
	const access_token = sessionStorage.getItem('access_token');
	const refresh_token = sessionStorage.getItem('refresh_token');
	const data = await fetchAPI('https://api.spotify.com/v1/me');
	console.log('[AccountData]: ', data);

	if (data) {
		document.querySelector('#spotifyLogin').classList.add('is-hidden');
		document.querySelector('#accountDetails').classList.remove('is-hidden');
		document.querySelector('#accountName').textContent = data.display_name;
		document.querySelector('#accountName').href = data.external_urls.spotify;
	}

	getPlaylists();
}

async function loadPlaylist(id) {
	const data = await fetchAPI(`https://api.spotify.com/v1/playlists/${id}`);
	console.log('[loadPlaylist]: ', data);
	resetTable();
	getTracks(data.tracks.href);
}

// Loop through all playlists from the user
async function getPlaylists(
	url = 'https://api.spotify.com/v1/me/playlists?limit=50',
) {
	const playlistData = await fetchAPI(url);
	console.log('[playlistData]: ', playlistData);

	if (playlistData) {
		playlistObj.total = playlistData.total;
		document.querySelector(
			'#playlistsStats',
		).textContent = `${playlistData.total} playlists available`;
		playlistObj.items.push(...playlistData.items);
		if (playlistData.next) {
			getPlaylists(playlistData.next); // TEMP COMMENT OUT TO REDUCE API CALLS
		}
		playlistData.items.forEach(addPlaylistSelectOption);
	}
}

function calculateColumns() {
	// Create a new copy of the array not a reference this looks stupid cause its a 2d array so you cant just use the spread operator

	let newSongArray = [];
	songArray.map((trackarray) => {
		newSongArray.push([...trackarray]);
	});

	console.log('newsongarraylength: ', newSongArray.length);
	// Loop through each record and remove an element if the coresponding checkbox is not checked
	for (let i = 0; i < newSongArray.length; i++) {
		console.log(newSongArray[i]);

		// define offset because when a col is delete others move over one.
		let offset = 0;

		// Probably a better way but idk
		if (el.checkbox.playlistNumber.checked === false) {
			newSongArray[i].splice(0, 1);
			offset++;
		}
		if (el.checkbox.trackName.checked === false) {
			newSongArray[i].splice(1 - offset, 1);
			offset++;
		}
		if (el.checkbox.artist.checked === false) {
			newSongArray[i].splice(2 - offset, 1);
			offset++;
		}
		if (el.checkbox.album.checked === false) {
			newSongArray[i].splice(3 - offset, 1);
			offset++;
		}
		if (el.checkbox.discNumber.checked === false) {
			newSongArray[i].splice(4 - offset, 1);
			offset++;
		}
		if (el.checkbox.trackNumber.checked === false) {
			newSongArray[i].splice(5 - offset, 1);
			offset++;
		}
		if (el.checkbox.duration.checked === false) {
			newSongArray[i].splice(6 - offset, 1);
			offset++;
		}
		if (el.checkbox.addedAt.checked === false) {
			newSongArray[i].splice(7 - offset, 1);
			offset++;
		}
		if (el.checkbox.spotifyId.checked === false) {
			newSongArray[i].splice(8 - offset, 1);
			offset++;
		}
		console.log(newSongArray[i]);
		console.log(songArray[i]);
	}

	exportToCsv('tracklist.csv', newSongArray);
}

function addEventHandlers() {
	el.checkbox.playlistNumber = document.querySelector(
		'#checkboxPlaylistNumber',
	);
	el.checkbox.trackName = document.querySelector('#checkboxTrackName');
	el.checkbox.artist = document.querySelector('#checkboxArtist');
	el.checkbox.album = document.querySelector('#checkboxAlbum');
	el.checkbox.discNumber = document.querySelector('#checkboxDiscNumber');
	el.checkbox.trackNumber = document.querySelector('#checkboxTrackNumber');
	el.checkbox.duration = document.querySelector('#checkboxDuration');
	el.checkbox.addedAt = document.querySelector('#checkboxAddedAt');
	el.checkbox.spotifyId = document.querySelector('#checkboxSpotifyID');
}

async function init() {
	addEventHandlers();
	const allCheckboxes = document.querySelectorAll('input[type=checkbox]');
	console.log(allCheckboxes);

	allCheckboxes.forEach((checkbox) => {
		checkbox.checked = true;
		checkbox.addEventListener('change', function (e) {
			switch (e.explicitOriginalTarget.id) {
				case 'checkboxPlaylistNumber':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide1');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide1');
					break;
				case 'checkboxTrackName':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide2');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide2');
					break;
				case 'checkboxArtist':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide3');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide3');
					break;
				case 'checkboxAlbum':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide4');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide4');
					break;
				case 'checkboxDiscNumber':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide5');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide5');
					break;
				case 'checkboxTrackNumber':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide6');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide6');
					break;
				case 'checkboxDuration':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide7');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide7');
					break;
				case 'checkboxAddedAt':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide8');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide8');
					break;
				case 'checkboxSpotifyID':
					document
						.querySelector('#tableHead')
						.classList.toggle('tableColHide9');
					document
						.querySelector('#tableBody')
						.classList.toggle('tableColHide9');
					break;
			}
		});
	});

	document.querySelector('#btnExport').addEventListener('click', function () {
		calculateColumns();
	});

	document.querySelector('#btnShowTable').addEventListener('click', () => {
		document.querySelector('#tableDiv').classList.remove('is-hidden');
	});

	document
		.querySelector('#spotifyLogin')
		.addEventListener('click', function () {
			window.location.href = '/login';
		});

	document.querySelector('#btnSelectSaved').addEventListener('click', () => {
		savedTabSelected();
		resetTable();
		isPlaylist = false;
		getTracks('https://api.spotify.com/v1/me/tracks?limit=50'); // Inital saved tracks call
	});

	document.querySelector('#btnSelectPlaylist').addEventListener('click', () => {
		playlistTabSelected();
		resetTable();
	});

	document
		.querySelector('#selectPlaylist')
		.addEventListener('change', (obj) => {
			const value = document.querySelector('#selectPlaylist').value;
			console.log('selected playlist', value);
			if (value != 'null') {
				isPlaylist = true;
				document.querySelector('#btnShowTable').disabled = false;
				loadPlaylist(value);
			} else {
				document.querySelector('#btnShowTable').disabled = true;
			}
		});

	document.querySelector('#btnLogout').addEventListener('click', () => {
		sessionStorage.clear();
		window.location.reload();
	});

	if (location.hash) {
		const search = location.hash.slice(1).split('&');
		const accessToken = search[0].slice(13); // cut off beginning of string array element
		const refreshToken = search[1].slice(14);
		console.log('access ', accessToken);
		console.log('refresh ', refreshToken);
		sessionStorage.setItem('access_token', accessToken);
		sessionStorage.setItem('refresh_token', refreshToken);
		// document.querySelector('#optionBtns').classList.toggle('is-hidden');
		window.location.href = window.location.href.split('#')[0];
	}
	getAccountInfo();
}

window.addEventListener('load', init);
