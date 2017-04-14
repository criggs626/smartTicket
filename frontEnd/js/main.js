// Get the modal
var newModal = document.getElementById('newModal');
var replyModal = document.getElementById('replyModal');
var assignModal = document.getElementById('assignModal');
var acceptModal = document.getElementById('acceptModal');
var closeModal = document.getElementById('closeModal');

// Get the button that opens the modal
var newBTN = document.getElementById("newBTN");
var replyBTN = document.getElementById("reply");
var assignee = document.getElementById("assignee");
var accept = document.getElementById("accept");
var closeTicket = document.getElementById("close");

// When the user clicks the button, open the modal
newBTN.onclick = function () {
    newModal.style.display = "block";

    categoryDrop("newCats", function () {
        asigneeDrop("newAssign");
    });

}

replyBTN.onclick = function () {
    replyModal.style.display = "block";

    categoryDrop("replyCats", function () {
        asigneeDrop("replyAssign");
    });


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
    asigneeDrop("assign");

    var id = $(".clickedRow > :first-child").text();
    $("form[name=assign] > input[name=ticket_id]").attr("value", id);
}

accept.onclick = function () {
    acceptModal.style.display = "block";
    var id = $(".clickedRow > :first-child").text();
    $("form[name=accept] > input[name=ticket_id]").attr("value", id);
}

closeTicket.onclick = function () {
    closeModal.style.display = "block";
    var id = $(".clickedRow > :first-child").text();
    $("form[name=close] > input[name=ticket_id]").attr("value", id);
}
// When the user clicks on <span> (x), close the modal
$(".close, .cancel").click(function () {
    newModal.style.display = "none";
    replyModal.style.display = "none";
    assignModal.style.display = "none";
    acceptModal.style.display = "none";
    closeModal.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == newModal || event.target == replyModal || event.target == assignModal || event.target == acceptModal || event.target == closeModal) {
        newModal.style.display = "none";
        replyModal.style.display = "none";
        assignModal.style.display = "none";
        acceptModal.style.display = "none";
        closeModal.style.display = "none";
    }
}

function categoryDrop(dropDown, callback) {
	dropdown = document.getElementById(dropDown);
    if (dropdown) {
		dropdown.innerHTML = "";
		$.get("/get_categories", function (categories) {
			for (i = 0; i < categories.length; i++) {
				if(i == 0)
					dropdown.innerHTML += '<option value="' + categories[i].CATEGORY_ID + '"'+($(".category").html()==categories[i].NAME ? "selected":"")+'>' + categories[i].NAME + '</option>';
				else
					dropdown.innerHTML += '<option value="' + categories[i].CATEGORY_ID + '"'+($(".category").html()==categories[i].NAME ? "selected":"")+'>' + categories[i].NAME + '</option>';
			}
			callback();
		});
	}
}

function asigneeDrop(dropDown) {
	dropdown = document.getElementById(dropDown);
	dropdown.innerHTML = "";
	$.get("/get_assignee", function (categories) {
		for (i = 0; i < categories.length; i++) {
			if(i == 0)
				dropdown.innerHTML += '<option value="' + categories[i].USER_ID + '" selected>' + categories[i].FNAME + " " + categories[i].LNAME + '</option>';
			else
				dropdown.innerHTML += '<option value="' + categories[i].USER_ID + '">' + categories[i].FNAME + " " + categories[i].LNAME + '</option>';
		}
	});
}

// DataTables code
if (pageName=="managerView"){
	var tableParams = {onlyOpen: true,onlyPersonal:true};
	accept.style.display="none";
	replyBTN.style.width="50%";
	$.get("/currentUser",function(data){
		$("#current").html(data.Fname+" "+data.Lname);
	});
}
else{
	var tableParams = {onlyOpen: true,onlyPersonal:false};
}
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
        type: "GET",
        data: tableParams//function(d) { return tableParams }
    },
    lengthChange: false,
    searching: false
})

$("#ticketTable tbody").on("click", "tr", function (event) {
    var data = table.row(this).data();
    var text = data.description;
    text = text.replace(/\n|(\r\n)/g, "<br>");
    $("#ticketViewer > .description").html(text);
    $("#ticketViewer > .header > .title").text(data.title);
    $("#ticketViewer > .header > .category").text(data.category);
    $("#ticketViewer > .header > .client_email").text(data.client_email);
    $("#ticketViewer > .ticket_id").text(data.id);
    // indicate that the row has been selected (for css)
    $(".clickedRow").removeClass("clickedRow");
    $(this).addClass("clickedRow");
	if (pageName=="managerView"){
		loadMessages(parseInt(data.id) || 0)
	}
    // // load messages, too
    // loadMessages(parseInt(data.id) || 0);
    // enable buttons
    $("#ticketViewer > .button").prop("disabled", false);
});

function loadMessages(ticket_id) {
    $.ajax({
        url: "/get_messages",
        data: {
            "ticket_id": ticket_id
        },
        cache: false,
        method: "GET",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            if (textStatus != "success") {
                console.error("Error retreiving messages: ", textStatus);
                return;
            }
			$("#messages").html("");
            for (var messageID in data) {
                addMessage(data[messageID]);
            }
            $("#messageLoading").addClass("displaynone");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error retrieving messages: ", errorThrown);
        }
    });
}
function addMessage(message) {
    var content = message.MESSAGE_CONTENT;
    // remove history data
    // gmail history
    try {
        content = content.split('> On ')[0];
    } catch (e) {
        // not a gmail
    }
    try {
    	content = content.substring(0, content.match(/[\r?\n?](> )?On .+wrote:[\r?\n?]/).index);
    } catch (e) {
	// not a gmail
    }
    // outlook history
    try {
        content = content.split('________________________________')[0];
    } catch (e) {
        // not an outlook email
    }
    //console.log(content);
    content = content.trim().split('\n').join('<br>');
	if (message.SENDER==0){
		$("#messages").append("<div class='sent'>"+message.USER_EMAIL+":<br>"+content+"</div>");
	}
	else{
		$("#messages").append("<div class='received'>"+message.CLIENT_EMAIL+":<br>"+content+"</div>");
	}
}
