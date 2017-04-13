const ROOT_DIR = "../frontEnd/";
const HOME = "TicketManagerHome.html";
const FAQ = "TicketManagerFAQ.html";
const REPORTS = "TicketManagerReports.html";
const LOGIN = "TicketManagerLogin.html";
const MANAGERS = "TicketManagers.html";
const INDEX = "SubmitTicket.html";
const SETTINGS = "TicketManagerSettings.html";
const MANAGERVIEW = "managerView.html";
const MANAGEUSERS = "userManagment.html"
const DEFAULT_SIZE = 50;
const DEBUG = false;
const DEFAULT_ASSIGNEE = "[0]";

module.exports = function (app, passport, express, mysqlConnection,replace,mysqlDump) {
    var path = require('path');
    var chooseManager = require('../machineLearning/chooseTicketManager.js')();
    var autoReply = require('../machineLearning/autoReply.js')(mysqlConnection);

    app.use(express.static(ROOT_DIR));

    app.use(function(req, res, next) {
        if(req.url.substr(-1) == '/' && req.url.length > 1)
            res.redirect(301, req.url.slice(0, -1));
        else
            next();
    });

    app.use('/home', isLoggedIn, function(req, res) {
        send(res, HOME);
    });

    app.get('/login', function(req, res) {
        send(res, LOGIN);
    });

    app.get('/faq',isLoggedIn, function(req, res) {
        send(res, FAQ);
    });

    app.get('/reports', function(req, res) {
        send(res, REPORTS);
    });

    app.get('/managers', isLoggedIn, function(req, res) {
        send(res, MANAGERS);
    });
    app.get('/settings', isLoggedIn, function(req, res) {
        send(res, SETTINGS);
    });

    app.get('/manageuser', isLoggedIn, function(req, res) {
        send(res, MANAGEUSERS);
    });


    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/' // redirect back to the signup page if there is an error
    }));

	app.use('/manager', isLoggedIn, function (req, res) {
        send(res, MANAGERVIEW);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect("/");
    });
    app.post('/submit_ticket', function(req, res) {
        var returnAddr = req.body.returnAddr || "/";
        returnAddr = returnAddr.trim();

        const VALID_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        var clientEmail = req.body.contact.trim();
        var title = req.body.summary.trim();
        var description = req.body.description.trim();
        var assignee_id = parseInt(req.body.assignee) || -1;
        var ticketType = parseInt(req.body['ticket type']) || 1;

        if (!VALID_EMAIL.test(clientEmail)) {
            res.redirect(returnAddr);
            // TODO: notify user of failure
            console.error("Invalid email provided.");
            return;
        }
        if (description == "") {
            res.redirect(returnAddr);
            // TODO: notify user of failure
            console.error("No description provided.");
            return;
        }
        // add user to database if they don't exist
        clientEmail = mysqlConnection.escape(clientEmail);
        var query = "INSERT IGNORE INTO CLIENTS (email) VALUES (" +
            clientEmail + ");";
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
                return;
            }
            var query = "SELECT client_id FROM CLIENTS WHERE email=" +
                clientEmail + ";";
            mysqlConnection.query(query, function(err, results, fields) {
                if (err) {
                    console.error("Unknown MySQL error occured: " + err);
                    return;
                }
                // function to handle ticket after assignment
                var afterGetAssignee = function() {
                    if (assignee_id == -1) {
                        assignee_id = DEFAULT_ASSIGNEE;
                    }
                    console.log("ML chose ", assignee_id);
                    var query = "INSERT INTO TICKETS " +
                        "(client, title, description, category, " +
                        "assignee_id, open_status) VALUES (" +
                        clientID + ", " +
                        mysqlConnection.escape(title) + ", " +
                        mysqlConnection.escape(description) + ", " +
                        ticketType + ", " +
                        assignee_id +
                        ", 1);";
                    mysqlConnection.query(query, function(err, results, fields) {
                        // return to webpage
                        res.redirect(returnAddr);
                        if (!err) {
                            // TODO: notify user of success, was accepted
                            console.log("Ticket succesfully submitted.");
                        } else {
                            // TODO: notify user of failure
                            console.error("Failed to add ticket to database.");
                        }
                    });
                    // attempt to auto-reply
                    var ticketData = title + " " + title + " " + description;
                    autoReply.getAutoReply(ticketData, function(err, data) {
                        if (err) {
                            console.error("Failed to auto-reply:", err);
                            return;
                        }
                        if (data != null) {
                            console.log("TODO auto-reply with mail.");
                            console.log(data);
                        }
                    });
                };
                // on success, add ticket to database
                var clientID = results[0].client_id;
                // get which ticket manager should deal with this ticket
                if (assignee_id < 1) {
                    chooseManager.choose({
                        clientEmail: clientEmail,
                        title: title,
                        text: description
                    }, function(err, result) {
                        if (err) {
                            console.error("Error retreiving user id: ", err);
                            return;
                        }
                        // determine whether the managerID is worthy
                        if (shouldAutoAssignManager(result.managerID)) {
                            assignee_id = result.managerID;
                        } else {
                            assignee_id = -1;
                        }
                        afterGetAssignee();
                    });
                } else {
                    // this was assigned manually. Learn from this.
                    chooseManager.train(
                        {
                            clientEmail: clientEmail,
                            title: title,
                            text: description
                        },
                        assignee_id,
                        function(err) {
                            if (err != null) console.log("Error training", err);
                            afterGetAssignee();
                        }
                    );
                }
            });
        });
    });
    // app.post('/reply_to_ticket', isLoggedIn, replyToTicket);
    app.post('/reply_to_ticket', function(req, res) {
        var returnAddr = req.body.returnAddr || "/";
        returnAddr = returnAddr.trim();
        var ticket_id = parseInt(req.body.ticket_id) || -1;
        var assignee_id = parseInt(req.body.assignee) || -1;
        var message = req.body.description.trim();
        var client_id = parseInt(req.body.client_id) || -1;
        var manager_id = (req.user) ? req.user.USER_ID : -1;

        if (ticket_id == -1) {
            res.redirect(returnAddr);
            // TODO: notify user of failure
            console.error("Invalid ticket id.");
            return;
        }
        if (message == "") {
            res.redirect(returnAddr);
            // TODO: notify user of failure
            console.error("No message provided.");
            return;
        }
        if (manager_id === null && client_id === null) {
            console.error('Cannot identify message sender.');
            return;
        }
        // add message to ticket
        var query = "INSERT INTO MESSAGES "
            + "(ticket, message_content, client, user, sender, time_sent)"
            + " VALUES (" +
            ticket_id + ", " +
            mysqlConnection.escape(message) + ", "
            // ticket sender
            + ((client_id == -1) ? "NULL" : client_id) + ", "
            // current user in passport session
            + ((client_id == -1) ? manager_id : "NULL") + ", "
            // 0 for currently signed-in manager, 1 for client
            + ((client_id == -1) ? 0 : 1) + ", "
            + "NOW());";
        mysqlConnection.query(query, function(err, results, fields) {
            // return to webpage
            if (!err) {
                // assign the ticket to the new ticket manager
				if (assignee_id!=-1){
					assignTicket(req, res);
				}
				res.redirect(returnAddr);
				return;
            } else {
                // TODO: notify user of failure
                console.error("Failed to add message to database: ", err);
				res.redirect(returnAddr);
				return;
            }
        });
    });

    app.post('/assign_ticket', isLoggedIn, assignTicket);

    function assignTicket(req, res) {
        var returnAddr = req.body.returnAddr || "/";
        returnAddr = returnAddr.trim();
        var ticket_id = parseInt(req.body.ticket_id) || -1;
        var assignee_id = parseInt(req.body.assignee || req.body.assignee_id || req.body.assign) || -1;
        if (ticket_id == -1) {
            res.redirect(returnAddr);
            // TODO: notify user of faiulre
            console.error("Invalid ticket id: '%d'", req.body.ticket_id);
            return;
        }
        if (assignee_id == -1) {
            // when assigning with nobody specified, this means that the manager
            // accepted the ticket. Set it to the currently signed-in ID.
            assignee_id = req.user.USER_ID;
        }
        var query = "UPDATE TICKETS SET assignee_id=" + assignee_id +
            " WHERE ticket_id=" + ticket_id + ";";
        mysqlConnection.query(query, function(err, results, fields) {
            // return to webpage
            res.redirect(returnAddr);
            if (!err) {
                // TODO: notify user of success, was accepted
                console.log("Ticket succesfully assigned.");
            } else {
                // TODO: notify user of failure
                console.error("Failed to change assignment in database.");
            }
        });
        // train the classifier on the ticket data
        query = "SELECT CLIENTS.email as email, title, description FROM TICKETS"
            + " LEFT JOIN CLIENTS ON TICKETS.client=CLIENTS.client_id"
            + " WHERE ticket_id=" + ticket_id + ";";
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Failed to obtain ticket data to train.", err);
            }
            // Manually assigned. Learn from this.
            var clientEmail = results[0].email;
            var title = results[0].title; // gimme that title title
            var description = results[0].description;
            chooseManager.train(
                {
                    clientEmail: clientEmail,
                    title: title,
                    text: description
                },
                assignee_id,
                function(err) {
                    if (err != null) console.log("Error training", err);
                }
            );
        });
    }

    app.post('/close_ticket', isLoggedIn, function(req, res) {
        var returnAddr = req.body.returnAddr || "/";
        returnAddr = returnAddr.trim();
        var ticket_id = parseInt(req.body.ticket_id) || -1;
        if (ticket_id == -1) {
            res.redirect(returnAddr);
            // TODO: notify user of faiulre
            console.error("Invalid ticket id: '%d'", req.body.ticket_id);
            return;
        }
        var query = "UPDATE TICKETS SET open_status=0 WHERE ticket_id=" +
            ticket_id + " LIMIT 1;";
        mysqlConnection.query(query, function(err, results, fields) {
            // return to webpage
            res.redirect(returnAddr);
            if (!err) {
                // TODO: notify user of success, was accepted
                console.log("Ticket succesfully closed.");
            } else {
                // TODO: notify user of failure
                console.error("Failed to close ticket in database.");
            }
        });
    });

    app.get('/get_messages', isLoggedIn, function(req, res) {
        var ticket_id = parseInt(req.query.ticket_id) || -1;
        if (ticket_id == -1) {
            res.redirect("/");
            // TODO: notify user of failure
            console.error("Invalid ticket id.");
            return;
        }
        var query = "SELECT *, CLIENTS.email as CLIENT_EMAIL, \n"
                + "USERS.work_email AS USER_EMAIL FROM MESSAGES \n"
                + "LEFT JOIN USERS ON MESSAGES.user=USERS.user_id \n"
                + "LEFT JOIN CLIENTS ON MESSAGES.client=CLIENTS.client_id\n"
				+ "WHERE TICKET="+ticket_id+";";
        mysqlConnection.query(query, function (err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            }
            res.json(results);
        })
    });

    app.get('/get_tickets', isLoggedIn, function(req, res) {
        var onlyOpen = (req.query.onlyOpen == "true");
        var onlyPersonal = (req.query.onlyPersonal == "true");
        var start = parseInt(req.query.start) || 0;
        var size = parseInt(req.query.length) || DEFAULT_SIZE;
        var query = 'SELECT ticket_id as id, title, description, open_status, \n'
                + 'priority, TICKETS.department as department, \n'
                + 'CLIENTS.email as client_email, CATEGORIES.name as category, \n'
                + 'category as category_id, assignee_id as assignee_ids \n'
                + 'FROM TICKETS \n'
                + 'LEFT JOIN CLIENTS ON CLIENTS.client_id=TICKETS.client \n'
                + 'LEFT JOIN CATEGORIES ON CATEGORIES.category_id=TICKETS.category \n'
                + 'WHERE 1=1 ' + ((onlyOpen) ? 'AND open_status=1 \n' : 'AND open_status=0 \n')
                + ((onlyPersonal) ? 'AND assignee_id LIKE "%'+req.user.USER_ID+'%"\n' : ' AND assignee_id LIKE "%0%" \n')
                + 'LIMIT ' + start + ', ' + size + ';\n'
		//console.log("open Status: "+req.query.onlyOpen+"\npersonal status: "+req.query.onlyPersonal+"\nquery:\n"+query);  //Display all relevant query info
        mysqlConnection.query(query, function (err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            }
            res.json(results);
        });
    });

    app.get('/get_categories', function(req, res) {
        var query = 'SELECT CATEGORY_ID, NAME FROM CATEGORIES;'
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            }
            res.json(results);
        });
    });

    app.get('/get_assignee', isLoggedIn, function(req, res) {
        var query = 'SELECT USER_ID, FNAME,LNAME FROM USERS ORDER BY FNAME;'
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            }
            res.json(results);
        });
    });

    app.get('/get_departments', isLoggedIn, function(req, res) {
        var query = 'SELECT * FROM DEPARTMENTS ORDER BY NAME;'
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            }
            res.json(results);
        });
    });

    app.post('/get_depEmployee', isLoggedIn, function(req, res) {
        var depID = req.body.ID;
        var query = 'SELECT USER_ID, FNAME,LNAME FROM USERS WHERE DEPARTMENT LIKE "%' + depID + '%" ORDER BY FNAME;'
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            }
            res.json(results);
        });
    });

    app.post('/new_department', isLoggedIn, function(req, res) {
        var returnAddr = "/managers";
        var query = 'SELECT PERMISSION FROM USERS WHERE USER_ID="' + req.user.USER_ID + '";';
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            } else {
                var permissions = results[0].PERMISSION;
                var name = req.body.depName.trim();
                if (permissions == 0) {
                    var query = 'INSERT INTO DEPARTMENTS (NAME) VALUES("' + name + '")';
                    mysqlConnection.query(query, function(err, results, fields) {
                        if (err) {
                            console.error("Unknown MySQL error occured: " + err);
                            res.redirect(returnAddr);
                        } else {
                            console.log("New Department '" + name + "' added");
                            res.redirect(returnAddr);
                        }
                    });
                } else {
                    console.error("Inadiquate permissions");
                }
            }
        });
    });

    app.post('/delete_department', isLoggedIn, function(req, res) {
        var returnAddr = req.body.returnAddr || "/";
        returnAddr = returnAddr.trim();
        var dep_id = parseInt(req.body.depID) || -1;
        if (dep_id == -1) {
            res.redirect(returnAddr);
            // TODO: notify user of faiulre
            console.error("Invalid ticket id: '%d'", req.body.depID);
            return;
        }
        var query = 'SELECT PERMISSION FROM USERS WHERE USER_ID="' + req.user.USER_ID + '";';
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            } else {
                var permissions = results[0].PERMISSION;
                if (permissions == 0) {
                    var query = "delete from DEPARTMENTS WHERE DEPARTMENT_ID=" +
                        dep_id + ";";
                    mysqlConnection.query(query, function(err, results, fields) {
                        // return to webpage
                        res.redirect(returnAddr);
                        if (!err) {
                            // TODO: notify user of success, was accepted
                            console.log("Department deleted");
                        } else {
                            // TODO: notify user of failure
                            console.error("Failed to delete department in database.");
                        }
                    });
                } else {
                    console.error("Inadiquate permissions");
                }
            }
        });

    });
    app.post('/addTo_department', isLoggedIn, function(req, res) {
        var returnAddr = req.body.returnAddr || "/";
        returnAddr = returnAddr.trim();
        var dep_id = (req.body.depID) || "-1";
        var assignee_id = parseInt(req.body.assignee || req.body.assignee_id || req.body.assign) || -1;
        if (dep_id == "-1") {
            res.redirect(returnAddr);
            // TODO: notify user of faiulre
            console.error("Invalid department id: '%d'", req.body.depID);
            return;
        }
        var query = 'SELECT PERMISSION FROM USERS WHERE USER_ID="' + req.user.USER_ID + '";';
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) {
                console.error("Unknown MySQL error occured: " + err);
            } else {
                var permissions = results[0].PERMISSION;
                if (permissions == 0) {
                    var query = 'SELECT DEPARTMENT FROM USERS WHERE USER_ID="' + assignee_id + '";';
                    mysqlConnection.query(query, function(err, results, fields) {
                        // return to webpage
                        if (!err) {
                            var deps = results[0].DEPARTMENT;
                            if (deps.indexOf(dep_id) == -1) {
                                var query = "UPDATE USERS SET DEPARTMENT='" + deps + "," + dep_id + "' WHERE USER_ID='" + assignee_id + "';";
                                mysqlConnection.query(query, function(err, results, fields) {
                                    if (err) {
                                        res.redirect(returnAddr);
                                        console.error("Unknown MySQL error occured: " + err);
                                    } else {
                                        res.redirect(returnAddr);
                                        console.log("User added");
                                    }
                                });
                            } else {
                                res.redirect(returnAddr);
                                console.log("The user is already a member of this department");
                            }
                        } else {
                            res.redirect(returnAddr);
                            // TODO: notify user of failure
                            console.error("Innadiquate permissions");
                        }
                    });
                } else {
                    console.error("Inadiquate permissions");
                }
            }
        });
    });

   app.post('/removeFromDepartment', isLoggedIn, function (req, res) {
    var returnAddr = "/managers";
    returnAddr = returnAddr.trim();
    var dep_id = (req.body.depID) || "-1";
    var assignee_id = parseInt(req.body.id || req.body.assignee_id || req.body.assign) || -1;
    if (dep_id == "-1") {
        res.redirect(returnAddr);
        // TODO: notify user of faiulre
        console.error("Invalid department id: '%d'", req.body.depID);
        return;
    }
    var query = 'SELECT PERMISSION FROM USERS WHERE USER_ID="' + req.user.USER_ID + '";';
    mysqlConnection.query(query, function (err, results, fields) {
        if (err) {
            console.error("Unknown MySQL error occured: " + err);
        } else {
            var permissions = results[0].PERMISSION;
            if (permissions == 0) {
                var query = 'SELECT DEPARTMENT FROM USERS WHERE USER_ID="' + assignee_id + '";';
                mysqlConnection.query(query, function (err, results, fields) {
                    // return to webpage
                    if (!err) {
                        var deps = results[0].DEPARTMENT;
						var updatedDeps=deps.replace(","+dep_id,"")
                        if (deps.indexOf(dep_id) != -1) {
                            var query = "UPDATE USERS SET DEPARTMENT='" + updatedDeps + "' WHERE USER_ID='" + assignee_id + "';";
                            mysqlConnection.query(query, function (err, results, fields) {
                                if (err) {
                                    res.redirect(returnAddr);
                                    console.error("Unknown MySQL error occured: " + err);
                                } else {
                                    res.redirect(returnAddr);
                                    console.log("User removed");
                                }
                            });
                        } else {
                            res.redirect(returnAddr);
                            console.log("The user is already a member of this department");
                        }
                    } else {
                        res.redirect(returnAddr);
                        // TODO: notify user of failure
                        console.error("Innadiquate permissions");
                    }
                });
            } else {
                console.error("Inadiquate permissions");
            }
        }
    });
});

	app.get("/currentUser",isLoggedIn,function(req,res){
		result={"Fname":req.user.FNAME,"Lname":req.user.LNAME,"id":req.user.USER_ID};
		res.json(result);
	});

	app.post("/changeColor",function(req,res){
		var returnAddr = req.body.returnAddr;
		var firstReplacement=req.body.first;
		var secondReplacment=req.body.second;
		var thirdReplacement=req.body.third;
		fs = require('fs')
fs.readFile('../frontend/colors', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  colors=JSON.parse(data)
  replace({
		regex: colors.first,
		replacement: firstReplacement,
		paths: ['../frontend/colors.css'],
		recursive: true,
		silent: true,
	});
	colors.first=firstReplacement;
	replace({
		regex: colors.second,
		replacement: secondReplacment,
		paths: ['../frontend/colors.css'],
		recursive: true,
		silent: true,
	});
	colors.second=secondReplacment;
	replace({
		regex: colors.third,
		replacement: thirdReplacement,
		paths: ['../frontend/colors.css'],
		recursive: true,
		silent: true,
	});
	colors.third=thirdReplacement;
	fs.writeFile("../frontend/colors", JSON.stringify(colors), 'utf8', function (err) {
     if (err) return console.log("Why!!!!"+err);
  });
});


		res.redirect(returnAddr)
	});
	app.get("/backup",isLoggedIn,function(req,res){
		mysqlDump({
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'smartTicket',
			dest:'./backup.sql' // destination file
		},function(err){
			if(!err){
				fs = require('fs')
				res.sendFile(path.join(__dirname,"./backup.sql"),function(){fs.unlink(path.join(__dirname,"./backup.sql"))});
				console.log("Database exported");
			}
			else{
				console.log("Error exporting database");
			}
			// create data.sql file;
		})
	});

  app.get("/privilege",function(req,res){
    var query = 'SELECT PERMISSION FROM USERS WHERE USER_ID="' + req.user.USER_ID + '";';
    mysqlConnection.query(query, function (err, results, fields) {
        if (err) {
            console.error("Unknown MySQL error occured: " + err);
            res.send(null);
        } else {
            var permissions = results[0].PERMISSION;
            res.send({"permission":permissions,"fname":req.user.FNAME,"lname":req.user.LNAME,"wemail":req.user.WORK_EMAIL,"pemail":req.user.PERSONAL_EMAIL,"phone":req.user.PHONE,"bday":req.user.BIRTH_DAY,"id":req.user.USER_ID});
        }
  });
});

app.get("/getUsers",function(req,res){
  var query = 'SELECT PERMISSION FROM USERS WHERE USER_ID="' + req.user.USER_ID + '";';
 mysqlConnection.query(query, function (err, results, fields) {
      if (err) {
          console.error("Unknown MySQL error occured: " + err);
          res.send(null);
      } else {
          var permissions = results[0].PERMISSION;
          if(permissions!=0){
            res.send(null);
          }
          else{
            var query = 'SELECT USER_ID,FNAME,LNAME FROM USERS;';
            mysqlConnection.query(query, function (err, results, fields) {
                if (err) {
                    console.error("Unknown MySQL error occured: " + err);
                    res.send(null);
                } else {
                  res.json(results);
                }
          });
          }
      }
});
});
app.post("/getPersonalInfo",isLoggedIn,function(req,res){
    var id = parseInt(req.body.id || req.body.assignee_id || req.body.assign) || -1;
    var query = 'SELECT USER_ID,FNAME,LNAME,WORK_EMAIL,PERSONAL_EMAIL,PHONE,BIRTH_DAY FROM USERS WHERE USER_ID='+id+';';
    mysqlConnection.query(query, function (err, results, fields) {
        if (err) {
            console.error("Unknown MySQL error occured: " + err);
            res.send(null);
        } else {
          res.json(results);
        }
  });
});

app.post("/updateUserInfo",isLoggedIn,function(req,res){
  var id=parseInt(req.body.id);
  var fname=req.body.fname;
  var lname=req.body.lname;
  var wemail=req.body.wemail;
  var pemail=req.body.pemail;
  var phone=req.body.phone;
  var query="UPDATE USERS SET FNAME='"+fname+"', LNAME='"+lname+"', WORK_EMAIL='"+wemail+"', PERSONAL_EMAIL='"+pemail+"', PHONE='"+phone+"'  WHERE USER_ID="+id+";";
  mysqlConnection.query(query,function(err,results,fields){
    if(err){
      console.error("Unknown MySQL error occured: "+err);
      res.send(null)
    }
    else{
      console.log("Updated User info");
      res.redirect("/manageuser");
    }
  });
});

app.post("/createNewUser",isLoggedIn,function(req,res){
  var fname=req.body.fname;
  var lname=req.body.lname;
  var wemail=req.body.wemail;
  var pemail=req.body.pemail;
  var phone=req.body.phone;
  var permission=req.body.permission;
  var password=req.body.password;
  var query="INSERT INTO USERS(PERMISSION,FNAME,LNAME,WORK_EMAIL,PERSONAL_EMAIL,PHONE,PASSWORD) VALUES(1,'"+fname+"','"+lname+"','"+wemail+"','"+pemail+"','"+phone+"',MD5("+password+"));";
  mysqlConnection.query(query,function(err,results,fields){
    if(err){
      console.error("Unknown MySQL error occured: "+err);
      res.send(null)
    }
    else{
      console.log("Created new user");
      res.redirect("/manageuser");
    }
  });
});

app.post("/deleteUser",isLoggedIn,function(req,res){
  var id=parseInt(req.body.id);
  var query="DELETE FROM USERS WHERE USER_ID="+id+";";
  mysqlConnection.query(query,function(err,results,fields){
    if(err){
      console.error("Unknown MySQL error occured: "+err);
      res.send(null)
    }
    else{
      console.log("Deleted user");
      res.redirect("/manageuser");
    }
  });
});

app.get("/getFAQ", function(req,res){
  var id=parseInt(req.body.id);
  var query="SELECT * FROM FAQ;";
  mysqlConnection.query(query,function(err,results,fields){
    if(err){
      console.error("Unknown MySQL error occured: "+err);
      res.send(null)
    }
    else{
      res.json(results);
    }
  });
});

app.post("/addFAQ",isLoggedIn,function(req,res){
  var question=req.body.question;
  var answer=req.body.answer;
  var query="INSERT INTO FAQ(QUESTION,ANSWER) VALUES('"+question+"','"+answer+"');";
  mysqlConnection.query(query,function(err,results,fields){
    if(err){
      console.error("Unknown MySQL error occured: "+err);
      res.send(null)
    }
    else{
      console.log("Added FAQ");
      res.redirect("/faq");
    }
  });
});

    // make sure that this one is last
    app.use('/', function(req, res) {
        send(res, INDEX);
    });

    function isLoggedIn(req, res, next) {
        // return next();
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated() || DEBUG)
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/login');
        console.log('Not logged in; redirecting...');
    }

    function send(request, file) {
        request.sendFile(path.join(__dirname, ROOT_DIR, file));
    }

    function shouldAutoAssignManager(score) {
        const THRESHOLD = 0.001;
        return score > THRESHOLD;
    }
}
