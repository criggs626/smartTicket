var gmail_api = require('./gmail_api.js');
var base64url = require('base64url');

module.exports = function (mysqlConnection) {
    return {
        /*
         * Automatically load all changes and handle new messages or adding
         * new messages to tickets.
         * Return the error.
         */
        handleUpdates: function(done) {
            // get last load time from database
            // getUpdates()
                // if successful, set last load time in database
                // for each new thread, submit a ticket
                // for each new message in a thread, add message to ticket
                //     and email managers about new message
                // TODO decide what else should be done for various kinds of
                //     new messages
            console.log('TODO handleUpdates');
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
            console.log('TODO getUpdates');
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
        /*
         * Given data about a ticket, add it to the database and notify the
         * manager that a ticket has been recieved.
         * Returns the error.
         * Note: 'to' may be null, meaning no manager is assigned yet.
         */
        recievedNewTicket: function(title, body, from, to, done) {
            console.log('TODO recievedNewTicket');
        },
        /*
         * Given data about a message, add it to the database, associate it with
         * a ticket, and notify (email) the manager that a reply has been made
         * (if the sender was not the manager).
         * Return the error.
         */
        recievedNewMessage: function(ticketID, title, body, from, done) {
            console.log('TODO recievedNewMessage');
        },
        // TODO remove
        test: function() {
            this.getUpdates(1490385831001, function(err, messages) {
                if (err) {
                    console.log("Totally recieved an error, bro:", err);
                    return;
                }
                console.log("Messages:\n", messages[0]);
            });
        },
    };
}

module.exports(null).test();
