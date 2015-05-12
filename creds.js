var watson = require('watson-developer-cloud');

var natural_language_classifier = watson.natural_language_classifier({
 	 username: 'INSERT YOUR USERNAME FOR THE SERVICE HERE',
 	 password: 'INSERT YOUR PASSWORD FOR THE SERVICE HERE',
 	 version: 'v1'
});
module.exports = natural_language_classifier;
