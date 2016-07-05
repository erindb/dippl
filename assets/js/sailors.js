$(document).ready(function() {
	$(".click2seeQn").hide();
	$(".click2seeQn").each(function() {
		var id = $(this).attr("id");
		$("#" + id).after("<p><button onclick='$(\"#" + id + "\").show()'>Show " + id + "</button></p>");
	});
});