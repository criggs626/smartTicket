function getDepartments(){
	var departTable=document.getElementById("deptTable");
	$.get("/get_departments",function(data){
	departTable.innerHTML="<tr><th>Departments</th></td>";
	for(i=0;i<data.length;i++){
		departTable.innerHTML+="<tr><td data-depID='"+data[i].DEPARTMENT_ID+"'>"+data[i].NAME+"</tr></td>";
	}
	departTable.innerHTML+="<tr><td data-create>Click to create a new department</tr></td>";
});
}
getDepartments();

function getManagers(id){
	
}

$("#deptTable").on("click","td",function(){
	depNumber=$(this).attr("data-depid");
	if(depNumber){
		getManagers(depNumber);
	}
	else{
		//insert Code for creating a new table
		alert("New");
	}
	
});

