var _ = require('underscore');

// Require and initialize the Twilio module with your credentials

var twilioNumber = "+19493810852";


/* ClOUD CODE FUNCTION: receiveSMS
 * -------------------------------
 * Triggered when Twilio receives an SMS to the above number.
 * Processes the message accordingly.  This function takes care
 * of the sign up / unsubscribe process.
 */
Parse.Cloud.define("receiveSMS", function(request, response) {
	Parse.Cloud.useMasterKey(); // So we can query against all users

	var phone = request.params.From;
	console.log("Received a text from " + phone);

	// Search for this number in our user list
	var query = new Parse.Query(Parse.User);
	query.equalTo("phoneNumber", phone);
	query.first().then(function(matchingUser) {

		// If we've not seen this number before at all...
		if(!matchingUser) {

			// Create new user and ask for their name
			var user = new Parse.User();
			user.set("username", phone);
			user.set("password", "Upliftio");
			user.set("phoneNumber", phone);
			user.set("firstName", "");			

			return user.signUp().then(function(user) {
				// TODO: Configure ACL to limit access to user data
				user.setACL(new Parse.ACL(user));
				return user.save().then(function() {
					return sendSMS(phone, "Hi there!  Welcome to Upliftio.  We'll send you funny, inspiring texts occasionally to keep you motivated.  What's your first name?");
				});
			});

		// If we've seen this number before, but haven't finished setup yet
		// (AKA we don't know their name), this text must be their name
		} else if (matchingUser && matchingUser.get("firstName") == "") {
			matchingUser.set("firstName", request.params.Body);

			return matchingUser.save().then(function(user) {
				return sendSMS(phone, "Hi " + user.get("firstName") + "!  Thanks for using Upliftio.  If you want to unsubscribe at any time (we'll miss you!), just text \"UPLIFTIO STOP\".");
			});

		// If we've seen this number before and they want to unsubscribe...
		} else if (matchingUser && request.params.Body == "UPLIFTIO STOP") {
			var name = matchingUser.get("firstName");
			return matchingUser.destroy().then(function() {
				return sendSMS(phone, "We'll miss you " + name + "!  If you ever want to resubscribe, just text us and we'll get you re-set up.");
			});

		// Otherwise, not sure what they're sending?
		} else {
			return sendSMS(phone, "What was that, " + matchingUser.get("firstName") + "?  To unsubscribe, text \"UPLIFTIO STOP\".");
		}

	}).then(function(smsResponseData) {
		response.success("Sent message to " + phone);
	}, function(error) {
		response.error("Error: " + error.message);
	});
});

/* CLOUD CODE FUNCTION: sendInspiration
 * ------------------------------------
 * Triggered when someone sends a message on the front end at upliftio.parseapp.com.
 * Adds "Hey {{name}}," to the beginning and sends an inspirational message
 * 
 */
Parse.Cloud.define('sendInspiration', function(request, response){

	Parse.Cloud.useMasterKey(); //So we can send the message to all Users

	if(request.params.password != "elephantsrule"){
		response.error('wrong password brah.');
	}

	var query = new Parse.Query(Parse.User);
	query.find().then(function(users){

		var promise = new Parse.Promise.as();
		_.each(users, function(user){
			promise = promise.then(function(){
				firstName = user.get("firstName");
				if (firstName == "") firstName = "awesome person";
				return sendSMS(user.get("phoneNumber"), "Hey " + firstName + ", " + request.params.message);
			});
		});

		return promise;

	}).then(function(){
		response.success("Messages Sent!");
	}, function(error){
		response.error('Error sending the messages');
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
 * 		   on the outcome of the message send.  Promise includes
 * 		   error object or success data.
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
	    if (err) promise.reject(err);
	    else promise.resolve(responseData);
	});

	return promise;
}


/* CLOUD CODE JOB: sendUpliftios
 * ------------------------------
 * Background job to send motivational texts to all users.
 */
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