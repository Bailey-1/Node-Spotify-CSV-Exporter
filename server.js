var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require('dotenv').config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URL; // Your redirect uri

console.log(redirect_uri);

var generateRandomString = function (length) {
	var text = '';
	var possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app
	.use(express.static(__dirname + '/public'))
	.use(cors())
	.use(cookieParser());

app.get('/login', function (req, res) {
	var state = generateRandomString(16);
	// var state = 'abdnfkwj93nd8dje';
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope =
		'user-library-read user-read-private user-read-email playlist-read-private';
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state,
			}),
	);
});

app.get('/callback', function (req, res) {
	// your application requests refresh and access tokens
	// after checking the state parameter

	// console.log('[query] ', req.query);

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;
	if (state === null || state !== storedState) {
		console.log('[state] ', state);
		console.log('[storedState] ', storedState);
		res.redirect(
			'../?' +
				querystring.stringify({
					error: 'state_mismatch',
				}),
		);
	} else {
		// res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code',
			},
			headers: {
				Authorization:
					'Basic ' +
					new Buffer(client_id + ':' + client_secret).toString('base64'),
			},
			json: true,
		};

		request.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				var options2 = {
					url: 'https://api.spotify.com/v1/me/player/currently-playing',
					headers: { Authorization: 'Bearer ' + access_token },
					json: true,
				};
				// res.redirect('/#' + access_token);
				res.redirect(
					'/#' +
						querystring.stringify({
							access_token: access_token,
							refresh_token: refresh_token,
						}),
				);
			} else {
				res.redirect(
					'/#' +
						querystring.stringify({
							error: 'invalid_token',
						}),
				);
			}
		});
	}
});

/* 
	Use the generated refresh token to create a new access token - pass the refresh token from the client to this route
	https://stackoverflow.com/questions/3487991/why-does-oauth-v2-have-both-access-and-refresh-tokens
*/
app.get('/refresh_token', function (req, res) {
	// requesting access token from refresh token
	console.log('[Log]: /refresh_token called');
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			Authorization:
				'Basic ' +
				new Buffer(client_id + ':' + client_secret).toString('base64'),
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		},
		json: true,
	};

	request.post(authOptions, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token;
			res.send({
				access_token: access_token,
			});
		} else {
			console.log('[error]: ', response);
		}
	});
});

app.get('/current', function (req, res) {});

console.log('Listening on 8888');
app.listen(8888);
