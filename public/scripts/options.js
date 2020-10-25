function savedTabSelected() {
	document.querySelector('#btnSelectSavedTab').classList.add('is-active');
	document.querySelector('#btnSelectPlaylistTab').classList.remove('is-active');
	document.querySelector('#selectPlaylistDiv').classList.add('is-hidden');

	document.querySelector('#optionsContainer').classList.remove('is-hidden');
}

function playlistTabSelected() {
	document.querySelector('#btnSelectSavedTab').classList.remove('is-active');
	document.querySelector('#btnSelectPlaylistTab').classList.add('is-active');
	document.querySelector('#selectPlaylistDiv').classList.remove('is-hidden');

	document.querySelector('#optionsContainer').classList.remove('is-hidden');
}

export { savedTabSelected, playlistTabSelected };
