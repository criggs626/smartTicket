const CONSTANTS_GO = "up here, too";

module.exports = function (mysqlConnection) {
    return {
        /*
         * Automatically load all changes and handle new messages or adding
         * new messages to tickets.
         * Return the status (true for good, false otherwise).
         */
        handleUpdates: function() {
            // get last load time from database
            // getUpdates()
                // if successful, set last load time in database
                // for each new thread, submit a ticket
                // for each new message in a thread, add message to ticket
                //     and email managers about new message
                // TODO decide what else should be done for various kinds of
                //     new messages
            console.log('TODO handleUpdates');
        }
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
        getUpdates: function(from, done) {
            console.log('TODO getUpdates');
        },
        /*
         * Given a recipient, title, and full html body, send the messages
         * using the Gmail API. Return the status (true for sent, err
         * otherwise).
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
         * Returns the status as true or false.
         * Note: 'to' may be null, meaning no manager is assigned yet.
         */
        recievedNewTicket: function(title, body, from, to, done) {
            console.log('TODO recievedNewTicket');
        },
        /*
         * Given data about a message, add it to the database, associate it with
         * a ticket, and notify (email) the manager that a reply has been made
         * (if the sender was not the manager).
         * Return the status as true or false.
         */
        recievedNewMessage: function(ticketID, title, body, from, done) {
            console.log('TODO recievedNewMessage');
        },
    };
}
