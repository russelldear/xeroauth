
var config = require('./config.json')
var OAuth = require('oauth');
var open = require('open');
var events = require('events');

var razor = new events.EventEmitter();
razor.on('requestTokenRetrieved', verifyAuthorisation);

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
var accessToken = "";
var accessTokenSecret = "";
var verifier = "";

console.log("Retrieving request token...")
oauth.getOAuthRequestToken(function(error, request_token, request_token_secret, requestResults){
	if(error) {
		console.log('error :' + error)
	}
	else { 
		console.log('oauth_token :' + request_token)
		console.log('oauth_token_secret :' + request_token_secret)

		requestToken = request_token;
		requestTokenSecret = request_token_secret;

		open(config.authoriseUri + request_token)

		console.log('Enter verification code:')

		razor.emit('requestTokenRetrieved');
	}
});

function verifyAuthorisation(){
	var stdin = process.openStdin();

	stdin.addListener("data", function(d) {
		verifier = d.toString().trim();
		getAccessToken();
		process.stdin.pause();
	});

	function getAccessToken() {
		oauth.getOAuthAccessToken(requestToken, requestTokenSecret, verifier, function(error, access_token, access_token_secret, accessResults) {
			console.log('access_token :' + access_token)
			console.log('access_token_secret :' + access_token_secret)

			var output = "";

			oauth.getProtectedResource("https://api.xero.com/api.xro/2.0/organisation", "GET", access_token, access_token_secret,  function (error, output, response) {
				console.log(output);
			});
		});
	}
}