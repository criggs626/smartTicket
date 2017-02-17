$(function() {
    // init
    addTicketClickListeners();



    function addTicketClickListeners() {
        $("#formSubmit").click(function(event) {
            event.preventDefault();
            $("#ticketForm").trigger("submit");
        });
    }
});