$.get("/getFAQ",function(data){
  for(i=0;i<data.length;i++){
    $("#content").append("<tr><td>"+data[i].QUESTION+"</td><td>"+data[i].ANSWER+"</td></tr>")
  }
  $("#content").append("<tr><td><button class='btn' onclick='addFAQ()'>Add FAQ</button></td></tr>")
});

function addFAQ(){
  $("#newModal").show();
}


$(".close, .cancel").click(function () {
  $("#newModal").hide();
});

window.onclick = function (event) {
    if (event.target == $("#updateModal")[0] || event.target == $("#newModal")[0]) {
      $("#newModal").hide();
    }
}
