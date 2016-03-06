
var config = require('./config.json');
var sql = require('./sql.js');
var OAuth = require('oauth');
var open = require('open');
var events = require('events');
var util = require('util');

var razor = new events.EventEmitter();
razor.on('requestTokenRetrieved', verifyAuthorisation);
razor.on('authorised', makeRequest);

var oauth = new OAuth.OAuth(
	config.requestUri,
	config.accessUri,
	config.consumerKey,
	config.consumerSecret,
	'1.0A',
	null,
	'HMAC-SHA1'
	);

var requestToken = "";
var requestTokenSecret = "";
var verifier = "";
var accessTokenSecret = "";

var token = sql.getToken(config.consumerKey, onTokenRetrieval);

function onTokenRetrieval(token){
	if (token != null) {
		accessToken = token.tokenKey;
		accessTokenSecret = token.tokenSecret;
		razor.emit('authorised')
	}
	else {
		getRequestToken();
	}
}

function getRequestToken(){
	console.log("Retrieving request token...")
	oauth.getOAuthRequestToken(function(error, request_token, request_token_secret, requestResults){
		if(error) {
			console.log('error :' + util.inspect(error))
		}
		else { 
			console.log('oauth_token :' + request_token)
			console.log('oauth_token_secret :' + request_token_secret)

			requestToken = request_token;
			requestTokenSecret = request_token_secret;

			open(config.authoriseUri + request_token)

			razor.emit('requestTokenRetrieved');
		}
	});
}

function verifyAuthorisation(){
	console.log('Enter verification code:')
	var stdin = process.openStdin();

	stdin.addListener("data", function(d) {
		verifier = d.toString().trim();
		getAccessToken();
		process.stdin.pause();
	});
}

function getAccessToken() {
	console.log("Retrieving access token...");
	oauth.getOAuthAccessToken(requestToken, requestTokenSecret, verifier, function(error, access_token, access_token_secret, accessResults) {
		console.log('access_token :' + access_token)
		console.log('access_token_secret :' + access_token_secret)

		sql.setToken(config.consumerKey, access_token, access_token_secret);

		accessToken = access_token;
		accessTokenSecret = access_token_secret;

		razor.emit('authorised')
	});
}

function makeRequest(){
	console.log("Making request...")
	oauth.getProtectedResource("https://api.xero.com/api.xro/2.0/organisation", "GET", accessToken, accessTokenSecret,  function (error, output, response) {
		console.log(output);
	});
}