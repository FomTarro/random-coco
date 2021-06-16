var fs = require('fs');
var readline = require('readline');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	if (err) {
		console.log('Error loading client secret file: ' + err);
		return;
	}
	// Authorize a client with the loaded credentials, then call the YouTube API.
	authorize(JSON.parse(content), getChannel);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function (err, token) {
		if (err) {
			getNewToken(oauth2Client, callback);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			callback(oauth2Client);
		}
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function (code) {
		rl.close();
		oauth2Client.getToken(code, function (err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
	try {
		fs.mkdirSync(TOKEN_DIR);
	} catch (err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
		if (err) throw err;
		console.log('Token stored to ' + TOKEN_PATH);
	});
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
	var service = google.youtube('v3');
	// const csv = fs.readFileSync('video-list.csv', 'utf8').split('\n');
	const csv = require('csv-parser')
	const results = [];

	fs.createReadStream('video-list-new.csv')
		.pipe(csv({
			mapHeaders: ({ header, index }) => index
		}))
		.on('data', (data) => results.push(data))
		.on('end', () => {
			const map = new Map();
			results.forEach(item => {
				const id = item['1'].split('=')[1];
				if (map.has(id) == false) {
					map.set(id, {
						id: id,
						url: item['1'],
						tags: new Set(),
						favorite: new Set(),
					});
					item['2'].split(',').forEach(tag => {
						map.get(id).tags.add(tag.trim().toLowerCase());
					})
					map.get(id).favorite.add(item['3']);
				} else {
					item['2'].split(',').forEach(tag => {
						map.get(id).tags.add(tag.trim().toLowerCase());
					})
					map.get(id).favorite.add(item['3']);
				}
			})
			const keys = [...map.keys()];
			const chunks = [];
			var chunk = [];
			for (var i = 0; i < map.size; i++) {
				if (chunk.length >= 50) {
					chunks.push(chunk);
					chunk = [];
				}
				chunk.push(keys[i]);
			}
			if (chunk.length > 0) {
				chunks.push(chunk);
			}
			const aggregate = []
			call(chunks.length - 1, chunks, map, aggregate, service, auth);
		});
}

function call(index, chunks, map, aggregate, service, auth) {
	// TODO: this needs to recurse
	console.log(`processing chunk ${index} of ${chunks.length - 1}`);
	console.log(chunks[index]);
	service.videos.list({
		auth: auth,
		part: [
			'id',
			'snippet',
			'contentDetails'
		],
		id: chunks[index]
	}, function (err, response) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		var channels = response.data.items;
		if (channels.length == 0) {
			console.log('No channel found.');
		} else {
			console.log(`lookup complete for chunk ${index}`);
			const results = response.data.items.map(item => {
				return {
					id: item.id,
					url: map.get(item.id).url,
					title: item.snippet.title,
					tags: [...map.get(item.id).tags],
					favorite: [...map.get(item.id).favorite]
				}
			});
			console.log(`processing complete for chunk ${index}`);
			aggregate.push(results);
			if (index <= 0) {
				mergeAndWrite(aggregate);
			} else {
				call(index - 1, chunks, map, aggregate, service, auth);
			}
		}
	});
}

function mergeAndWrite(aggregate) {
	const masterList = JSON.parse(fs.readFileSync('../templates/clips.json', 'utf8'));
	const masterMap = new Map();
	masterList.map(obj => {
		if (masterMap.has(obj.url)) {
			console.log(`duplicate entry: ${obj.url}`)
		}
		masterMap.set(obj.url, obj
		)
	});
	aggregate.flat().forEach(obj => {
		if(masterMap.has(obj.url)){
			console.log('combining entries');
			masterMap.get(obj.url).tags = masterMap.get(obj.url).tags.concat(obj.tags);
		}else{
			masterMap.set(obj.url, obj);
		}
	})
	fs.writeFileSync('./out2.json', JSON.stringify([...masterMap.values()], null, 2));
	console.log('done!')
}
