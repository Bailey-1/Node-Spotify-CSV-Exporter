// Runs when users selects the saved tab
function savedTabSelected() {
	document.querySelector('#btnSelectSavedTab').classList.add('is-active');
	document.querySelector('#btnSelectPlaylistTab').classList.remove('is-active');
	document.querySelector('#selectPlaylistDiv').classList.add('is-hidden');

	document.querySelector('#optionsContainer').classList.remove('is-hidden');
	document.querySelector('#btnShowTable').disabled = false;
	document.querySelector('#tableDiv').classList.add('is-hidden');
	document.querySelector('#selectPlaylist').value = 'null';
}

// Runs when users selects the playlist tab
function playlistTabSelected() {
	document.querySelector('#btnSelectSavedTab').classList.remove('is-active');
	document.querySelector('#btnSelectPlaylistTab').classList.add('is-active');
	document.querySelector('#selectPlaylistDiv').classList.remove('is-hidden');

	document.querySelector('#optionsContainer').classList.remove('is-hidden');
	document.querySelector('#btnShowTable').disabled = true;
	document.querySelector('#tableDiv').classList.add('is-hidden');
}

export { savedTabSelected, playlistTabSelected };
