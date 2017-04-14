var gmail_api = require('./gmail_api.js');
var base64url = require('base64url');
var request = require('request');
var nodemailer = require('nodemailer');

module.exports = function (mysqlConnection, config, port) {

    var smtpTransport = nodemailer.createTransport({
        server: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: config.gmail_username,
            pass: config.gmail_password,
        }
    });

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
                _this.getUpdates(since, function(err, emails) {
                    if (err) {
                        console.error('Error downloaded email data:', err);
                    }
                    // If successful, set last load time in database,
                    // which is sourced from latest email to avoid errors.
                    var now = since;
                    for (var i = 0; i < emails.length; i++) {
                        if (emails[i].time > now) {
                            now = emails[i].time;
                        }
                    }
                    now += 1;
                    mysqlConnection.query(
                        'UPDATE EMAIL_STATISTICS SET LAST_LOADED_EMAIL='
                        + now + ';',
                        function(err) {
                            if (err) console.error(
                                'Failed to update latest load time:', err);
                        }
                    );
                    for (var i = 0; i < emails.length; i++) {
                        var email = emails[i];
                        var id = _this.getTicketID(email);
                        if (id !== -1) {
                            _this.addMessageToTicket(email, id, function(err) {
                                if (err) {
                                    console.error('Message failed to be added'
                                        + 'to ticket ' + id + ':', err);
                                }
                            });
                        } else {
                            _this.submitTicket(email, function(err) {
                                if (err) {
                                    console.error('Ticket failed to submit:',
                                        err);
                                }
                            });
                        }
                    }
                    done(null, emails.length);
                });
            });
        },
        /*
         * Given an email, determine return it's corresponding ticketID (if
         * it's a message) or -1 (if it's a new ticket).
         * Return the id.
         */
        getTicketID: function(email) {
            var regexp = /Ticket\ <(\d+)>/;
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
                        'suppressEmail': true,
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
                            'suppressEmail': true,
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
                    'from': '',
                    'to': '',
                    'title': '',
                    'body': '',
                    'time': 0, // unix timestamp
                };

                // get body
                emailData.body = getBody(email.payload);
                if (emailData.body === undefined || emailData.body === '') {
                    addOneLoaded();
                    return;
                }

                // get headers
                var latestTime = 0;
                for (var i = 0; i < email.payload.headers.length; i++) {
                    var header = email.payload.headers[i];
                    if (header.name == 'To') {
                        var v = header.value;
                        if (v.indexOf('<') > -1) { // 'Name <email@email.com>'
                            v = v.split('<')[1];
                            v = v.substring(0, v.length - 1);
                        }
                        emailData.to = v;
                    } else if (header.name == 'Subject') {
                        emailData.title = header.value;
                    } else if (header.name == 'Date') {
                        emailData.time = new Date(header.value).getTime();
                        // var s = new Date(header.value).toString();
                        // if (s.indexOf('Apr') > -1) console.log(s);
                        // It's too old! Yes, too old to begin the training.
                        if (emailData.time < since) {
                            addOneLoaded();
                            return;
                        }
                    } else if (header.name == 'From') {
                        var v = header.value;
                        if (v.indexOf('<') > -1) { // 'Name <email@email.com>'
                            v = v.split('<')[1];
                            v = v.substring(0, v.length - 1);
                        }
                        emailData.from = v;
                    }
                }
                // ignore emails that are sent by the smartTicket system
                if (emailData.from != config.gmail_username) {
                    emails.push(emailData);
                }
                addOneLoaded();
            }
            function getBody(emailPayload) {
                if (emailPayload.body.size > 0) {
                    return base64url.decode(emailPayload.body.data);
                } else {
                    var str = "";
                    for (var i = 0; i < emailPayload.parts.length; i++) {
                        var part = emailPayload.parts[i];
                        // TODO don't just ignore attachements
                        // (part.body.attachementID != undefined)
                        if (part.body.data && part.mimeType == 'text/plain') {
                            var bodyPart = base64url.decode(part.body.data);
                            str += bodyPart;
                        }
                    }
                    return str;
                }
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
                    if (!response.messages) {
                        console.log('No emails found online');
                        return;
                    }
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
            // remove '' from around to if they exist
            if (to[0] == '\'') to = to.substring(1);
            if (to[to.length - 1] == '\'') to = to.substring(0, to.length - 1);
            //console.log('sendMessage', to, title, body);
            var mailOptions = {
                to: to,
                subject: title,
                html: body,
            };
            smtpTransport.sendMail(mailOptions, done);
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
    };
}
