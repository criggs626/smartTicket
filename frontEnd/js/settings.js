$(function() {
    $("#settingsTable td").click(function(event) {
        var text = event.originalEvent.target.innerHTML;
        text = text.split(" ").join("").toLowerCase();
        $("#" + text + "Modal").css("display", "block");
    });
    $(".close, .cancel").click(function(event) {
        $(".modal").css("display", "none");
    });
    $(".modal").click(function(event) {
        if ($(event.target).hasClass("modal")) {
            $(".modal").css("display", "none");
        }
    });
});
