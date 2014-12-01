//Initialize the Parse SDK
Parse.initialize("875InjBieGp3C0KQImOX9Pt884YTn8ihl7NuNkhj", "hDYLGDxVOwnGSaeQg9FZLpyVAGCKGxzl944A9Yoy");

$(document).ready(function(){
	
	initializePage();
});

var initializePage = function(){
	$("button").click(function(e){
		e.preventDefault();
		var message = $("#message").val();
		$("#message").val("");
		var from = $(this).text();
		console.log(from);
		console.log(message);
		Parse.Cloud.run('sendInspiration', {message: message}, {
			success: function(data){

			},
			error:function(err){
				$("button").text("Error: "+ err);
				console.log(err);
			}
		});

	});
}