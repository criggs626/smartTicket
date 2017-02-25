var firstReply = true;
var firstNew = true;
var firstAssign = true;
/*Sort table alphanumberically by column*/
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("ticketTable");
    switching = true;
    //Set the sorting direction to ascending:
    dir = "asc";
    /*Make a loop that will continue until
     no switching has been done:*/
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.getElementsByTagName("TR");
        /*Loop through all table rows (except the
         first, which contains table headers):*/
        for (i = 1; i < (rows.length - 1); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
             one from current row and one from the next:*/
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /*check if the two rows should switch place,
             based on the direction, asc or desc:*/
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /*If a switch has been marked, make the switch
             and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /*If no switching has been done AND the direction is "asc",
             set the direction to "desc" and run the while loop again.*/
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

/*Filters ticket table by name of user*/
/*(could possibly be expanded to search by ticket manager or ticket number)*/
function myFunction() {
    // Declare variables
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("ticketTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// Get the modal
var newModal = document.getElementById('newModal');
var replyModal = document.getElementById('replyModal');
var assignModal = document.getElementById('assignModal');
var confirmation = document.getElementById('confirmModal');

// Get the button that opens the modal
var newBTN = document.getElementById("newBTN");
var replyBTN = document.getElementById("reply");
var assignee = document.getElementById("assignee");
var accept = document.getElementById("accept");
var closeTicket = document.getElementById("close");

// When the user clicks the button, open the modal
newBTN.onclick = function () {
    newModal.style.display = "block";
    if (firstNew) {
        categoryDrop("newCats", function () {
            asigneeDrop("newAssign");
        });
        firstNew = false;
    }
}

replyBTN.onclick = function () {
    replyModal.style.display = "block";
    if (firstReply) {
        categoryDrop("replyCats", function () {
            asigneeDrop("replyAssign");
        });
        firstReply = false;
    }
    // show client email in modal's title
    var clientEmail = $("#ticketViewer > .client_email").text();
    $("#replyEmail").text(clientEmail);
    $(".TicketForm input[name=contact]").attr("value", clientEmail);
    var id = $(".clickedRow > :first-child").text();
    $(".TicketForm input[name=ticket_id]").attr("value", id);
}

// // reload messages list after
// $("form[name=reply]").submit(function(event) {
//     var id = $("form[name=reply] > input[name=ticket_id]").attr("value");
//     loadMessages(parseInt(id));
// });

assignee.onclick = function () {
    assignModal.style.display = "block";
    if (firstAssign) {
        asigneeDrop("assign");
        firstAssign = false;
    }
}

accept.onclick=function(){
    confirmation.style.display = "block";
}

closeTicket.onclick=function(){
    confirmation.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
$(".close").click(function () {
    newModal.style.display = "none";
    replyModal.style.display = "none";
    assignModal.style.display = "none";
    confirmation.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == newModal || event.target == replyModal || event.target == assignModal || event.target == confirmation) {
        newModal.style.display = "none";
        replyModal.style.display = "none";
        assignModal.style.display = "none";
        confirmation.style.display = "none";
    }
}

function categoryDrop(dropDown, callback) {
    dropdown = document.getElementById(dropDown);
    $.get("/get_categories", function (categories) {
        for (i = 0; i < categories.length; i++) {
            dropdown.innerHTML += '<option value="' + categories[i].CATEGORY_ID + '">' + categories[i].NAME + '</option>';
        }
        callback();
    });
}

function asigneeDrop(dropDown) {
    dropdown = document.getElementById(dropDown);
    $.get("/get_assignee", function (categories) {
        for (i = 0; i < categories.length; i++) {
            dropdown.innerHTML += '<option value="' + categories[i].USER_ID + '">' + categories[i].FNAME + " " + categories[i].LNAME + '</option>';
        }
    });
}

// DataTables code
var table = $("#ticketTable").DataTable({
    paging: true,
    columns: [
        {data: "id"},
        {data: "client_email"},
        {data: "title"},
        {data: "category"}
    ],
    ajax: {
        url: "/get_tickets",
        dataSrc: "",
        type: "GET"
    },
    lengthChange: false,
    searching: false
})

$("#ticketTable tbody").on("click", "tr", function (event) {
    var data = table.row(this).data();
    var text = data.description;
    text = text.replace(/\n|(\r\n)/g, "<br>");
    $("#ticketViewer > .description").html(text);
    $("#ticketViewer > .title").text(data.title);
    $("#ticketViewer > .client_email").text(data.client_email);
    $("#ticketViewer > .ticket_id").text(data.id);
    // indicate that the row has been selected (for css)
    $(".clickedRow").removeClass("clickedRow");
    $(this).addClass("clickedRow");
    // // load messages, too
    // loadMessages(parseInt(data.id) || 0);
});

function loadMessages(ticket_id) {
    $("#messages").children().not("#messageTemplate").remove();
    $("#messageLoading").removeClass("displaynone");
    $.ajax({
        url: "/get_messages",
        data: {
            "ticket_id": ticket_id
        },
        cache: false,
        method: "GET",
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
            if (textStatus != "success") {
                console.error("Error retreiving messages: ", textStatus);
                return;
            }
            for (var messageID in data) {
                addMessage(data[messageID]);
            }
            $("#messageLoading").addClass("displaynone");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Error retrieving messages: ", errorThrown);
        }
    });
}
function addMessage(message) {
    var messageElem = $("#messageTemplate")[0].cloneNode(true);
    messageElem.id = "message" + message.MESSAGE_ID;
    var sender = (message.SENDER == 0) ? message.USER_EMAIL : message.CLIENT_EMAIL;
    $(messageElem).find(".sender").text(sender);
    $(messageElem).find(".body").text(message.MESSAGE_CONTENT);
    $("#messages").append(messageElem);
}
