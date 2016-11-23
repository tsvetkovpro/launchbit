$(document).ready(function() {
    $("#forgotpass").click( function() {
        $("#forgotpasswordbox").show();
        $("#loginbox").hide();
    });

    $("#backtologin").click( function() {
        $("#forgotpasswordbox").hide();
        $("#loginbox").show();
    });
});