let refreshToken;

// Rich did this
function removeContentFrom(what) {
	while (what.firstElementChild) {
		what.firstElementChild.remove();
	}
}

// Get a new access token from the refresh access token & reload the page to use it
async function refreshAccessToken(refreshToken) {
	console.log('[refreshAccessToken()]');
	const result = await fetch(`/refresh_token?refresh_token=${refreshToken}`);
	const data = await result.json();
	const accessToken = data.access_token;
	window.location.hash = `access_token=${accessToken}&refresh_token=${refreshToken}`;
	location.reload();
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

function createStats(totalSeconds, totalTracks) {
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

async function fetchAPI(accessToken, refreshToken, url) {
	let data;
	await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + accessToken,
		},
	})
		.then(async (response) => {
			if (response.ok) {
				data = response.json(); // If request is successful save the response as data
				// return response.json();
			} else if (response.status === 401) {
				console.log(
					'response status is 401. Which means access token is too old.',
				);
				await refreshAccessToken(accessToken, refreshToken);
				// fetchAPI(accessToken, url); // Fetch the same API again using the new access token
			} else {
				throw new Error('Something went wrong');
			}
		})
		.catch((error) => {
			console.log(error);
		});
	return data;
}

export {
	removeContentFrom,
	refreshAccessToken,
	exportToCsv,
	createStats,
	playDemo,
	stopDemo,
	fetchAPI,
};
