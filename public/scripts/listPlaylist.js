// Create a new option node for each playlist and add it to the select
function addPlaylistSelectOption(option) {
	const optionNode = document.createElement('option');
	optionNode.value = option.id;
	optionNode.textContent = `${option.name} - ${option.owner.display_name}`;
	document.querySelector('#selectPlaylist').appendChild(optionNode);
}

export { addPlaylistSelectOption };
