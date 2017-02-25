const ROOT_DIR = "../frontEnd/";
const HOME = "TicketManagerHome.html";
const LOGIN = "TicketManagerLogin.html";
const INDEX = "SubmitTicket.html";
const DEFAULT_SIZE = 50;
const DEBUG = false;
module.exports = function (app, passport, express, mysqlConnection) {
	var path = require('path');
	var chooseManager = require('../machinelearning/chooseTicketManager.js')(
			mysqlConnection);

	app.use(express.static(ROOT_DIR));

	app.use('/home', isLoggedIn, function (req, res) {
		send(res, HOME);
	});

	app.get('/login', function (req, res) {
		send(res, LOGIN);
	});
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/home', // redirect to the secure profile section
		failureRedirect: '/' // redirect back to the signup page if there is an error
	}));

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect("/");
	});
	app.post('/submit_ticket', function (req, res) {
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
		var query = "INSERT IGNORE INTO clients (email) VALUES ("
				+ clientEmail + ");";
		mysqlConnection.query(query, function (err, results, fields) {
			if (err) {
				console.error("Unknown MySQL error occured: " + err);
				return;
			}
			var query = "SELECT client_id FROM clients WHERE email="
					+ clientEmail + ";";
			mysqlConnection.query(query, function (err, results, fields) {
				if (err) {
					console.error("Unknown MySQL error occured: " + err);
					return;
				}
				// function to add ticket to database
				var afterGetAssignee = function() {
					var query = "INSERT INTO tickets "
							+ "(client, title, description, category, "
							+ "assignee_id) VALUES (" + clientID + ", "
							+ mysqlConnection.escape(title) + ", "
							+ mysqlConnection.escape(description) + ", "
							+ ticketType + ", "
							+ assignee_id + ");";
					mysqlConnection.query(query, function (err, results, fields) {
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
				};
				// on success, add ticket to database
				var clientID = results[0].client_id;
				// get which ticket manager should deal with this ticket
				if (assignee_id == -1) {
					chooseManager.choose({
						clientEmail: clientEmail,
						title: title,
						description: description
					}, function(err, id) {
						if (err) {
							console.error("Error retreiving user id: ", err);
							return;
						}
						assignee_id = id;
						afterGetAssignee();
					});
				} else {
					afterGetAssignee();
				}
			});
		});
	});
	app.post('/reply_to_ticket', isLoggedIn, function (req, res) {
		var returnAddr = req.body.returnAddr || "/";
		returnAddr = returnAddr.trim();

		var ticket_id = parseInt(req.body.ticket_id) || -1;
		var assignee_id = parseInt(req.body.assignee) || -1;
		var message = req.body.description.trim();
		var ticketType = parseInt(req.body['ticket type']) || 1;

		if (ticket_id == -1) {
			res.redirect(returnAddr);
			// TODO: notify user of failure
			console.error("Invalid ticket id.");
			return;
		}
		if (assignee_id == -1) {
			res.redirect(returnAddr);
			// TODO: notify user of failure
			console.error("Invalid assignee id.");
			return;
		}
		if (message == "") {
			res.redirect(returnAddr);
			// TODO: notify user of failure
			console.error("No message provided.");
			return;
		}
		// add message to ticket
		var query = "INSERT INTO messages "
			+ "(ticket, message_content, user, sender, time_sent) VALUES ("
			+ ticket_id + ", "
			+ mysqlConnection.escape(message) + ", "
			+ req.user.USER_ID + ", " // current user in passport session
			+ "0, NOW());";
		mysqlConnection.query(query, function(err, results, fields) {
			// return to webpage
			if (!err) {
				// assign the ticket to the new ticket manager
				assignTicket(req, res);
			} else {
				// TODO: notify user of failure
				console.error("Failed to add message to database: ", err);
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
			res.redirect(returnAddr);
			// TODO: notify user of failure
			console.error("Invalid assignee id.");
			return;
		}
		var query = "UPDATE tickets SET assignee_id=" + assignee_id
			+ " WHERE ticket_id=" + ticket_id + ";";
		mysqlConnection.query(query, function(err, results, fields) {
			// return to webpage
			res.redirect(returnAddr);
			if (!err) {
				// TODO: notify user of success, was accepted
				console.log("Ticket succesfully assigned.");
			} else {
				// TODO: notify user of failure
				console.error("Failed to change assignemnt in database.");
			}
		});
	}

	app.get('/get_messages', isLoggedIn, function (req, res) {
		var ticket_id = parseInt(req.query.ticket_id) || -1;
		if (ticket_id == -1) {
			res.redirect("/");
			// TODO: notify user of failure
			console.error("Invalid ticket id.");
			return;
		}
		var query = "SELECT *, clients.email as CLIENT_EMAIL, "
			+ "users.work_email AS USER_EMAIL FROM messages "
			+ "LEFT JOIN users ON messages.user=users.user_id "
			+ "LEFT JOIN clients ON messages.client=clients.client_id;";
		mysqlConnection.query(query, function (err, results, fields) {
			if (err) {
				console.error("Unknown MySQL error occured: " + err);
			}
			res.json(results);
		})
	});

	app.get('/get_tickets', isLoggedIn, function (req, res) {
		var start = parseInt(req.query.start) || 0;
		var size = parseInt(req.query.length) || DEFAULT_SIZE;
		var query = 'SELECT ticket_id as id, title, description, open_status, '
				+ 'priority, tickets.department as department, '
				+ 'clients.email as client_email, categories.name as category, '
				+ 'category as category_id, assignee_id as assignee_ids '
				+ 'FROM tickets '
				+ 'LEFT JOIN clients ON clients.client_id=tickets.client '
				+ 'LEFT JOIN categories ON categories.category_id=tickets.category '
				+ 'LIMIT ' + start + ', ' + size + ';'
		mysqlConnection.query(query, function (err, results, fields) {
			if (err) {
				console.error("Unknown MySQL error occured: " + err);
			}
			res.json(results);
		});
	});

	app.get('/get_categories', isLoggedIn, function (req, res) {
		var query = 'SELECT CATEGORY_ID, NAME FROM categories;'
		mysqlConnection.query(query, function (err, results, fields) {
			if (err) {
				console.error("Unknown MySQL error occured: " + err);
			}
			res.json(results);
		});
	});

	app.get('/get_assignee', isLoggedIn, function (req, res) {
		var query = 'SELECT USER_ID, FNAME,LNAME FROM users ORDER BY FNAME;'
		mysqlConnection.query(query, function (err, results, fields) {
			if (err) {
				console.error("Unknown MySQL error occured: " + err);
			}
			res.json(results);
		});
	});


	// make sure that this one is last
	app.use('/', function (req, res) {
		send(res, INDEX);
	});

	function isLoggedIn(req, res, next) {
		// return next();
		// if user is authenticated in the session, carry on
		if (req.isAuthenticated() || DEBUG)
			return next();

		// if they aren't redirect them to the home page
		res.redirect("/login");
	}

	function send(request, file) {
		request.sendFile(path.join(__dirname, ROOT_DIR, file));
	}
}
