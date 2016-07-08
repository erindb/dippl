$(document).ready(function() {
	$(".click2seeQn").hide();
	$(".click2seeQn").each(function() {
		var id = $(this).attr("id");
		$("#" + id).before("<p><button onclick='$(\"#" + id + "\").toggle()'>Show " + id + "</button></p>");
	});
});