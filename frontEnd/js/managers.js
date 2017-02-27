function getDepartments() {
    var departTable = document.getElementById("deptTable");
    $.get("/get_departments", function (data) {
        departTable.innerHTML = "<tr><th>Departments</th></tr>";
        for (i = 0; i < data.length; i++) {
            departTable.innerHTML += "<tr><td data-depID='" + data[i].DEPARTMENT_ID + "'>" + data[i].NAME + "</td></tr>";
        }
        departTable.innerHTML += "<tr><td><b>Create New</b></td></tr>";
    });
}
getDepartments();

function getManagers(id) {
    var managerTable=document.getElementById("managerTable");
    $.post("/get_depEmployee", {"ID": id}, function (data) {
        managerTable.innerHTML = "<tr><th>Ticket Managers</th></tr>";
        for (i = 0; i < data.length; i++) {
            managerTable.innerHTML += "<tr><td data-depID='" + data[i].USER_ID + "'>" + data[i].FNAME+" "+data[i].LNAME + "</td></tr>";
        }
        managerTable.innerHTML += "<tr><td><b>Create New</b></td></tr>";
    });
}

$("#deptTable").on("click", "td", function () {
    depNumber = $(this).attr("data-depid");
    if (depNumber) {
        getManagers(depNumber);
    } else {
        //insert Code for creating a new table
        alert("New");
    }

});

