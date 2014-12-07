//Initialize the Parse SDK
Parse.initialize("875InjBieGp3C0KQImOX9Pt884YTn8ihl7NuNkhj", "hDYLGDxVOwnGSaeQg9FZLpyVAGCKGxzl944A9Yoy");

$(document).ready(function(){
	initializePage();
});

// Set up the click handler for the submit button
var initializePage = function(){
	$("button").click(function(e){
		e.preventDefault();
		var message = $("#message").val();
		var password = $("#password").val();

		// Clear out the text fields
		$("#message").val("");
		$("#password").val("");

		// Call the cloud function to send the message to all users
		Parse.Cloud.run('sendInspiration', {message: message, password: password}, {
			success: function(data){
				$("button").text("Mesage sent!  Check Cloud Code logs for individual successes/errors");
			},
			error:function(err){
				$("button").text("Error: " + err.message);
			}
		});

	});
}