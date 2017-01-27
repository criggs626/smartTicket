$(function() {
    // init
    addTicketClickListeners();



    function addTicketClickListeners() {
        $("tr.ticket").click(function(event) {
            var id = event.currentTarget.id;
            if (id != "-1") {
                console.log("TODO show loading");
                $.get("ticket.php", {"id": id},
                      function(data, textStatus, jqXHR) {
                    if (textStatus == "success") {

                        // get the individual data elements
                        var ticketID = data[0];
                        var ticketTitle = data[1];
                        var ticketClient = data[2];
                        var ticketAssignee = data[3];
                        var ticketPriority = data[4];
                        var ticketBody = data[5];
                        
                        // apply them to the document
                        $("#viewTicketID  .data").text(ticketID);
                        $("#viewTicketTitle").html('“'+ticketTitle+'”');
                        $("#viewTicketClient").html(ticketClient);
                        $("#viewTicketBodyMessages").html(ticketBody);

                    } else {
                        alert("Error getting page in view_ticket.js");
                    }
                }, "json");
            }
        });
    }
});