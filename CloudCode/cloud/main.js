var _ = require('underscore');

// Require and initialize the Twilio module with your credentials
var client = require('twilio')('ACffe86e93803489cf4ead8104edd0ad06', '18e0a2805156c8822b687ed7c9438f2e');
var twilioNumber = "12408984686";

// Cloud function triggered when the above phone # receives an SMS message
Parse.Cloud.define("receiveSMS", function(request, response) {
	Parse.Cloud.useMasterKey(); // So we can query against all users

	var phone = request.params.From;
	console.log("Received a text from " + phone);

	// Search for this number in our user list
	var query = new Parse.Query(Parse.User);
	query.equalTo("phoneNumber", phone);
	query.first().then(function(matchingUser) {

		// If we've not seen this number before...
		if(!matchingUser) {
			// TODO: Make a new user

		} else {
			// TODO: Check if they want to unsubscribe
		}

	}).then(function() {
		response.success();
	}, function(error) {
		response.error("Error");
	});
});



/* FUNCTION: sendSMS
 * -------------------
 * Parameters:
 * 		recipient: a string containing the phone number
 *			       to message (e.g. "+12223334444")
 * 		message: a string containing the message to send
 * 
 * Returns: a promise, rejected or resolved depending
 * 		   on the outcome of the message send.
 *
 * A promise-ified function that sends the given message
 * to the given phone number.
 */
function sendSMS(recipient, message) {
	var promise = new Parse.Promise();

	client.sendSms({
	    to:recipient, 
	    from: twilioNumber, 
	    body: message
	  }, function(err, responseData) { 
	    if (err) promise.reject();
	    else promise.resolve();
	});

	return promise;
}


// Background job to send messages to all users
Parse.Cloud.job("sendUpliftios", function(request, status) {
	
	Parse.Cloud.useMasterKey(); // So we can query against all users

	var query = Parse.Query(Parse.User);
	query.find().then(function(users) {
		
		// Send a message to all users
		var promise = new Parse.Promise.as();
		_.each(users, function(user) {

			promise = promise.then(function() {
				// TODO: Send message to "user"
			});
		});

		return promise;


	}).then(function() {
		status.success("Sent messages!");
	}, function(error) {
		status.error("Could not send messages.");
	});
});