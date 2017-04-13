var permission;
var user;

function fullManage(){
  var managerTable=document.getElementById("managerTable");
  managerTable.style.display="";
  $.get("/getUsers", function (data) {
    if(data!=null){
      for (i = 0; i < data.length; i++) {
          managerTable.innerHTML += "<tr><td>" + data[i].FNAME+" "+data[i].LNAME + "</td><td><button class='btn' onclick='editUser("+data[i].USER_ID+")'>Edit</button><button class='btn' style='margin-left:5px;' onclick='deleteUser("+data[i].USER_ID+")'>Delete</button></td></tr>";
      }
      managerTable.innerHTML += "<tr><td><button class='btn' onclick='newUser()'>Create New</button></td></tr>";
    }
    else{
      console.log("No");
    }
  });
}

function personalManage(){
  $("#individual").show();
  console.log(user);
  $("#id").val(user.id);
  $("#Pemail").val(user.pemail);
  $("#Wemail").val(user.wemail);
  $("#Phone").val(user.phone);
  $("#Fname").val(user.fname);
  $("#Lname").val(user.lname);
}

function deleteUser(id){
  $.post("/deleteUser",{"id":id},function(data, textStatus){
    console.log("Successfully deleted user.");
    location.reload();
  });
}

function editUser(id){
  $.post("/getPersonalInfo",{"id":id},function(data){
    $("#id1").val(data[0].USER_ID);
    $("#Pemail1").val(data[0].PERSONAL_EMAIL);
    $("#Wemail1").val(data[0].WORK_EMAIL);
    $("#Phone1").val(data[0].PHONE);
    $("#Fname1").val(data[0].FNAME);
    $("#Lname1").val(data[0].LNAME);
    $("#updateModal").show();
  });
}

function newUser(){
  $("#newModal").show();
}

$.get("/privilege",function(data){
  $("#current").html(data.fname+" "+data.lname);
  user=data;
  permission=data.permission;
  if(permission==0){
      fullManage();
  }
  else{
      personalManage();
  }
});

$(".close, .cancel").click(function () {
  $("#updateModal").hide();
  $("#newModal").hide();
});

window.onclick = function (event) {
    if (event.target == $("#updateModal")[0] || event.target == $("#newModal")[0]) {
      $("#updateModal").hide();
      $("#newModal").hide();
    }
}
