var gmail_api = require('./gmail_api.js');
var base64url = require('base64url');
var request = require('request');

module.exports = function (mysqlConnection, port) {
    return {
        /*
         * Automatically load all changes and handle new messages or adding
         * new messages to tickets.
         * Return the error.
         */
        handleUpdates: function(done) {
            // get last load time from database
            var _this = this;
            var QUERY = 'SELECT LAST_LOADED_EMAIL as lastLoad'
                + ' FROM EMAIL_STATISTICS LIMIT 1;';
            mysqlConnection.query(QUERY, function(err, result, fields) {
                var since = 0;
                if (err) {
                    console.error('Failed to load email data from database;'
                        + ' defaulting to 0.');
                } else {
                    since = result[0].lastLoad;
                }
                // DEBUG MODE ONLY!!! REMOVE WHEN ACTUALLY DEPLOYED!!!
                since = 0;
                // UGH THIS WOULD BE SO BAD TO KEEP LYING AROUND!!!
                _this.getUpdates(since, function(err, emails) {
                    if (err) {
                        console.error('Error downloaded email data:', err);
                    }
                    // if successful, set last load time in database
                    mysqlConnection.query(
                        'UPDATE EMAIL_STATISTICS SET LAST_LOADED_EMAIL=NOW();',
                        function(err) {
                            if (err) console.error(
                                'Failed to update latest load time:', err);
                        });
                    for (var i = 0; i < emails.length; i++) {
                        var email = emails[i];
                        var id = _this.getTicketID(email);
                        if (id !== -1) {
                            _this.addMessageToTicket(email, id, function(err) {
                                if (err) {
                                    console.error('Message failed to be added'
                                        + 'to ticket ' + id + ':', err);
                                }
                            })
                        } else {
                            continue;
                            _this.submitTicket(email, function(err) {
                                if (err) {
                                    console.error('Ticket failed to submit:',
                                        err);
                                }
                            });
                        }
                    }
                    done(null);
                });
            });
        },
        /*
         * Given an email, determine return it's corresponding ticketID (if
         * it's a message) or -1 (if it's a new ticket).
         * Return the id.
         */
        getTicketID: function(email) {
            var regexp = /<span\ id=ticketID>(\d+)<\/span>/;
            var regexMatch = email.body.match(regexp);
            if (!regexMatch) return -1;
            var intID = parseInt(regexMatch[1]);
            if (isNaN(intID)) return -1;
            return intID;
        },
        /*
         * Given an email, submit a new ticket with the email's data.
         * Return the error.
         */
        submitTicket: function(email, done) {
            // just send a post request since we already wrote the code
            const uri = 'http://127.0.0.1:' + port + '/submit_ticket';
            request.post(
                uri,
                {
                    json: {
                        'contact': email.from,
                        'summary': email.title,
                        'description': email.body,
                    }
                },
                function (err, response, body) {
                    if (err) {
                        console.error(
                            'Couldn\'t submit ticket with POST:',
                            err);
                        return;
                    }
                    if (response.statusCode === 200
                        || response.statusCode === 302) {
                        done(null);
                    } else {
                        console.error('Unexpected response:',
                            response.statusCode);
                    }
                }
            );
        },
        /*
         * Given an email and ticketID, add to ticket as a new message with the
         * email's data.
         * Return the error.
         */
        addMessageToTicket: function(email, ticketID, done) {
            // like above, send a request to have routes.js do the hard work
            this.getUserIdForEmail(email.from, function(err, userID) {
                if (err) {
                    console.error('Failed to add message from email:', err);
                    return;
                }
                const uri = 'http://127.0.0.1:' + port + '/reply_to_ticket';
                request.post(
                    uri,
                    {
                        json: {
                            'ticket_id': ticketID,
                            'description': email.body,
                            'client_id': userID,
                        }
                    },
                    function (err, response, body) {
                        if (err) {
                            console.error(
                                'Couldn\'t reply to ticket with POST:',
                                err);
                            return;
                        }
                        if (response.statusCode === 200
                            || response.statusCode === 302) {
                            done(null);
                        } else {
                            console.error('Unexpected response:',
                            response.statusCode);
                        }
                    }
                );
            });
        },
        /*
         * Get id of user given their email.
         */
        getUserIdForEmail: function(email, done) {
            const QUERY = 'SELECT CLIENT_ID FROM CLIENTS WHERE EMAIL=\''
                + email + '\' LIMIT 1;';
            mysqlConnection.query(QUERY, function(err, result) {
                if (err) {
                    console.error('Failed to get client emails:', err);
                    done(err);
                    return;
                }
                if (result.length > 0) {
                    done(null, result[0].CLIENT_ID);
                } else {
                    mysqlConnection.query('INSERT INTO CLIENTS (EMAIL)'
                        + ' VALUES (\'' + email + '\')',
                        function(err, result) {
                            if (err) {
                                console.error('Failed to add client to '
                                    + 'database:', err);
                                done(err);
                                return;
                            }
                            done(null, result.insertId);
                        }
                    );
                }
            });
            // if it exists,
            // return it,
            // else make a new one,
            // and return that one.
        },
        /*
         * Given a unix timestamp (UTC?) return all emails recieved since that
         * time (passed to 'done' as 'messages').
         * Format:
         *    [
         *        {
         *            "from": "example@example.com",
         *            "to": "smartticket0@gmail.com",
         *            "title": "I have a happy title",
         *            "body": "<p>Given the choice between the two of you,</p>",
         *            "time": 38998993982, // unix timestamp
         *        },
         *        ...
         *    ]
         */
        getUpdates: function(since, done) {
            var total = 0, loaded = 0, emails = [];
            function addOneLoaded() {
                if (++loaded >= total) {
                    // all have been loaded!
                    done(null, emails);
                }
            }
            function forEachLoaded(email) {
                // Email will be the raw json data.
                // Convert it to a more useable format and return it to done
                var emailData = {
                    "from": "",
                    "to": "",
                    "title": "",
                    "body": "",
                    "time": 0, // unix timestamp
                };
                var bodyRaw = email.payload.body.data;
                if (bodyRaw === undefined || bodyRaw === "") {
                    addOneLoaded();
                    return;
                }
                emailData.body = base64url.decode(bodyRaw);

                for (var i = 0; i < email.payload.headers.length; i++) {
                    var header = email.payload.headers[i];
                    if (header.name == 'To') { // 'To'
                        var v = header.value;
                        v = v.split('<')[1];
                        v = v.substring(0, v.length - 1);
                        emailData.to = v;
                    } else if (header.name == 'Subject') { // 'Thread-Topic'
                        emailData.title = header.value;
                    } else if (header.name == 'Date') {
                        emailData.time = new Date(header.value).getTime();
                        // It's too old! Yes, too old to begin the training.
                        if (emailData.time < since) {
                            addOneLoaded();
                            return;
                        }
                    } else if (header.name == 'Return-Path') { // 'From'
                        emailData.from = header.value.substring(1,
                            header.value.length - 1);
                    }
                }
                emails.push(emailData);

                addOneLoaded();
            }
            // get authentication rights to use API
            gmail_api.obtainAuth(function(auth, google) {
                // specifically use gmail API
                var gmail = google.gmail('v1');

                // get an overview of each message (ids)
                gmail.users.messages.list({
                    auth: auth,
                    userId: 'me',
                }, function(err, response) {
                    if (err) {
                        console.error("There was an error obtaining messages:", err);
                        return;
                    }
                    total = response.resultSizeEstimate;
                    var id;
                    for (var i = 0; i < response.messages.length; i++) {
                        id = response.messages[i].id;
                        gmail.users.messages.get({
                            auth: auth,
                            userId: 'me',
                            id: id,
                        }, function(err, response) {
                            if (err) {
                                console.error("Failed to load those particular messages:", err);
                                return;
                            }
                            forEachLoaded(response);
                        });
                    }
                });
            });
        },
        /*
         * Given a recipient, title, and full html body, send the messages
         * using the Gmail API. Return the error.
         */
        sendMessage: function(to, title, body, done) {
            console.log('TODO sendMessage');
        },
        /*
         * Use this when sending certain kinds of messages, which would only
         * vary slightly and so don't need to include all details.
         * Return the result as true or false.
         * Types [reply, auto-faq-reply, confirmation, closed, ...] // TODO
         */
        sendMessageOfType: function(type, to, title /* ??? */, body, done) {
            console.log('TODO sendMessageOfType');
        },
        // /*
        //  * Given data about a ticket, add it to the database and notify the
        //  * manager that a ticket has been recieved.
        //  * Returns the error.
        //  * Note: 'to' may be null, meaning no manager is assigned yet.
        //  */
        // recievedNewTicket: function(title, body, from, to, done) {
        //     console.log('TODO recievedNewTicket');
        // },
        // /*
        //  * Given data about a message, add it to the database, associate it with
        //  * a ticket, and notify (email) the manager that a reply has been made
        //  * (if the sender was not the manager).
        //  * Return the error.
        //  */
        // recievedNewMessage: function(ticketID, title, body, from, done) {
        //     console.log('TODO recievedNewMessage');
        // },
        // TODO remove
        test: function() {
            // this.getUpdates(1490385831001, function(err, messages) {
            //     if (err) {
            //         console.log("Totally recieved an error, bro:", err);
            //         return;
            //     }
            //     console.log("Messages:\n", messages[0]);
            // });
            // var email = 'GabeHWebsites6@gmail.com';
            // this.getUserIdForEmail(email, function(err, id) {
            //     console.log('I DONE DOWNLOADED ID:', id, 'for', email);
            // });
            this.handleUpdates(function(err) {
                if (err) {
                    console.log('Failed to load mail:', err);
                    return;
                }
                console.log('Refreshed email.');
            });
        },
    };
}
