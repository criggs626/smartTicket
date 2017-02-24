const ROOT_DIR = "../frontEnd/";
        const HOME = "TicketManagerHome.html";
        const LOGIN = "TicketManagerLogin.html";
        const INDEX = "SubmitTicket.html";
        const DEFAULT_SIZE = 50;
        const DEBUG = true;
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
                const VALID_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                var clientEmail = req.body.contact.trim();
                var title = req.body.summary.trim();
                var description = req.body.description.trim();
                var ticketType = req.body['ticket type'].trim();
                var attachment = req.body.attachment;

                if (!VALID_EMAIL.test(clientEmail)) {
                    res.redirect("/");
                    // TODO: notify user of failure
                    console.error("Invalid email provided.");
                    return;
                }
                if (description == "") {
                    res.redirect("/");
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
                        // on success, add ticket to database
                        var clientID = results[0].client_id;
                        // get which ticket manager should deal with this ticket
                        var managerID = chooseManager.choose({
                            clientEmail: clientEmail,
                            title: title,
                            description: description
                        });
                        // add ticket to database
                        var query = "INSERT INTO tickets (client, title, description, "
                                + "asignee_id) VALUES (" + clientID + ", "
                                + mysqlConnection.escape(title) + ", "
                                + mysqlConnection.escape(description) + ", "
                                + managerID + ");";
                        mysqlConnection.query(query, function (err, results, fields) {
                            // return to webpage
                            res.redirect("/");
                            if (!err) {
                                // TODO: notify user of success, was accepted
                                console.log("Ticket succesfully submitted.");
                            } else {
                                // TODO: notify user of failure
                                console.error("Failed to add ticket to database.");
                            }
                        });
                    });
                });
            });

            app.get('/get_tickets', function (req, res) {
                var start = parseInt(req.query.start) || 0;
                var size = parseInt(req.query.length) || DEFAULT_SIZE;
                var query = 'SELECT ticket_id as id, title, description, open_status, '
                        + 'priority, tickets.department as department, '
                        + 'clients.email as client_email, categories.name as category, '
                        + 'category as category_id, asignee_id as assignee_ids '
                        + 'FROM tickets '
                        + 'LEFT JOIN clients ON clients.client_id=tickets.client '
                        + 'LEFT JOIN categories ON categories.category_id=tickets.category '
                        + 'LIMIT ' + start + ', ' + size + ';'
                mysqlConnection.query(query, function (err, results, fields) {
                    if (err)
                        return callback(err, null);
                    res.json(results);
                });
            });

            app.get('/get_categories', isLoggedIn, function (req, res) {
                var query = 'SELECT CATEGORY_ID, NAME FROM categories;'
                mysqlConnection.query(query, function (err, results, fields) {
                    if (err)
                        return callback(err, null);
                    res.json(results);
                });
            });

            app.get('/get_assignee', isLoggedIn, function (req, res) {
                var query = 'SELECT USER_ID, FNAME,LNAME FROM users ORDER BY FNAME;'
                mysqlConnection.query(query, function (err, results, fields) {
                    if (err)
                        return callback(err, null);
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
                res.redirect("/");
            }

            function send(request, file) {
                request.sendFile(path.join(__dirname, ROOT_DIR, file));
            }
        }
