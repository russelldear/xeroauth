var OAuth = require('oauth');
var open = require('open');

var oauth = new OAuth.OAuth(
	'https://api.xero.com/oauth/RequestToken',
	'https://api.xero.com/oauth/AccessToken',
	'9Y1R7TLMO2WFQW5WKIGXMKHQE3NK9X',
	'WJYOSP4QYX4QFBYPYHI8MJ1D5Y2VPC',
	'1.0A',
	null,
	'HMAC-SHA1'
	);

var requestToken = "";
var requestTokenSecret = "";
var accessToken = "";
var accessTokenSecret = "";
var verifier = "";

oauth.getOAuthRequestToken(function(error, request_token, request_token_secret, requestResults){
	if(error) {
		console.log('error :' + error)
	}
	else { 
		console.log('oauth_token :' + request_token)
		console.log('oauth_token_secret :' + request_token_secret)
		console.log('results :' + requestResults)

		requestToken = request_token;
		requestTokenSecret = request_token_secret;

		open("https://app.xero.com/oauth/APIAuthorise?oauth_token=" + request_token)

		console.log('Enter verification code:')
	}
});

// Go get verification code: https://app.xero.com/oauth/APIAuthorise?oauth_token=OAUTHTOKENFROMPREVIOUS

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
		console.log('results :' + accessResults)
		
		var output = "";

		oauth.getProtectedResource("https://api.xero.com/api.xro/2.0/organisation", "GET", access_token, access_token_secret,  function (error, output, response) {
			console.log(output);
		});
	});
}
