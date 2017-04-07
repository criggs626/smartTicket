var permission;
var user;

function fullManage(){
  var managerTable=document.getElementById("managerTable");
  managerTable.style.display="";
  $.get("/getUsers", function (data) {
console.log(data);
    if(data!=null){
      for (i = 0; i < data.length; i++) {
          managerTable.innerHTML += "<tr><td>" + data[i].FNAME+" "+data[i].LNAME + "</td><td><button class='btn' onclick='editUser("+data[i].USER_ID+")'>Edit</button></td></tr>";
      }
      managerTable.innerHTML += "<tr><td><b>Create New</b></td></tr>";
    }
    else{
      console.log("No");
    }
  });
}

function personalManage(){
  $("#individual").show();
  $("#Pemail").val(user.pemail);
  $("#Wemail").val(user.wemail);
  $("#Phone").val(user.phone);
  $("#Fname").val(user.fname);
  $("#Lname").val(user.lname);
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
