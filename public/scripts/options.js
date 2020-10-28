// Runs when users selects the saved tab
function savedTabSelected() {
	document
		.querySelector('#btnSelectSaved')
		.classList.add('is-selected', 'is-success');
	document
		.querySelector('#btnSelectPlaylist')
		.classList.remove('is-selected', 'is-success');
	document.querySelector('#selectPlaylistDiv').classList.add('is-hidden');

	document.querySelector('#optionsContainer').classList.remove('is-hidden');
	document.querySelector('#btnShowTable').disabled = false;
	document.querySelector('#tableDiv').classList.add('is-hidden');
	document.querySelector('#selectPlaylist').value = 'null';
}

// Runs when users selects the playlist tab
function playlistTabSelected() {
	document
		.querySelector('#btnSelectSaved')
		.classList.remove('is-selected', 'is-success');
	document
		.querySelector('#btnSelectPlaylist')
		.classList.add('is-selected', 'is-success');
	document.querySelector('#selectPlaylistDiv').classList.remove('is-hidden');

	document.querySelector('#optionsContainer').classList.remove('is-hidden');
	document.querySelector('#btnShowTable').disabled = true;
	document.querySelector('#tableDiv').classList.add('is-hidden');
}

export { savedTabSelected, playlistTabSelected };
