var Datastore = require('nedb');
var util = require('util');

var db = new Datastore({ filename: 'tokenstore.db', autoload: true });

module.exports = {
	getToken: function(consumerKey, callback){

		var result = db.find({ consumerKey: consumerKey }, function (err, docs) {
			if (err != null || docs.length > 1) {
				console.log("Error retrieving token from db: " + err + " - " + util.inspect(docs));
				callback(null);
			}
			else if (docs.length < 1) {
				callback(null);
			}
			else {
				callback(docs[0]);
			}
		});
	},
	setToken: function(consumerKey, tokenKey, tokenSecret) {

		var doc = { consumerKey: consumerKey, tokenKey: tokenKey, tokenSecret: tokenSecret };

		db.insert(doc, function (err, newDoc) { 
			if (err != null){
				console.log("Error saving to db: " + err) 
			}
		});
	}
}