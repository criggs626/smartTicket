function getDepartments() {
    var departTable = document.getElementById("deptTable");
    $.get("/get_departments", function (data) {
        departTable.innerHTML = "<tr><th>Departments</th></tr>";
        for (i = 0; i < data.length; i++) {
            departTable.innerHTML += "<tr><td id='test' data-depID='" + data[i].DEPARTMENT_ID + "'>" + data[i].NAME + "</td></tr>";
        }
        departTable.innerHTML += "<tr><td><b>Create New</b></td></tr>";
    });
}

function getManagers(id) {
    var managerTable=document.getElementById("managerTable");
    $.post("/get_depEmployee", {"ID": id}, function (data) {
        managerTable.innerHTML = "<tr><th>Ticket Managers</th><th data-depid='"+id+"'>Delete</th></tr>";
        for (i = 0; i < data.length; i++) {
            managerTable.innerHTML += "<tr><td data-depID='"
                + data[i].USER_ID + "'>"+ data[i].FNAME + " " + data[i].LNAME
                + "</td><td><button class='btn' onclick='removeUser("
                + data[i].USER_ID + "," + id + ")'>X</button></td></tr>";
        }
        managerTable.innerHTML += "<tr><td data-add='"+id+"'><b>Add User</b></td></tr>";
    });
}

$("#deptTable").on("click", "td", function () {
    depNumber = $(this).attr("data-depid");
    if (depNumber) {
        getManagers(depNumber);
    } else {
        //Open new department modal
		$("#newModal").show();
    }
});

$("#managerTable").on("click", "td", function () {
    depNumber = $(this).attr("data-add");
    if (depNumber) {
		$("#addUser").attr("value", depNumber);
		$("#assignModal").show();
    }
});

$("#managerTable").on("click", "th", function () {
    depNumber = $(this).attr("data-depid");
    if (depNumber) {
		$("#dep").attr("value", depNumber);
		$("#confirmDelete").show();
    } else {

    }
});

function removeUser(id,department){
	$.post("/removeFromDepartment",{"id":id,"depID":department},function(){
		location.reload();
	});
}
//Modal Code

$(".close, .cancel").click(function () {
    $("#newModal").hide();
	$("#confirmDelete").hide();
	$("#assignModal").hide();
});

window.onclick = function (event) {
    if (event.target == $("#newModal")[0] || event.target == $("#confirmDelete")[0] || event.target==$("#assignModal")[0]) {
        $("#newModal").hide();
		$("#confirmDelete").hide();
		$("#assignModal").hide();
    }
}

//menu code
function asigneeDrop(dropDown) {
    dropdown = document.getElementById(dropDown);
    dropdown.innerHTML = "";
    $.get("/get_assignee", function (categories) {
        for (i = 0; i < categories.length; i++) {
            dropdown.innerHTML += '<option value="' + categories[i].USER_ID + '">' + categories[i].FNAME + " " + categories[i].LNAME + '</option>';
        }
    });
}
getDepartments();
asigneeDrop("assign");
