module.exports = function (mysqlConnection) {
    return {
        /*
         * Given text data from the ticket, return the correct ticket manager
         * and a percentage of how fit they are.
         * Returns an object: {managerID: XX, score: X.XXXXX}
         */
        choose: function(data, done) {
            // data = {
            //     clientEmail: "example@example.com",
            //     title: "title",
            //     text: "description"
            // }
            // get text data
            // title is twice as important as the text
            var tokens = this.processTokens(data.title, data.text)
            // use dataCount to assess scores
            var dataCount = require('./dataCount.json')
            var scores = this.calcScores(tokens, dataCount);
            // list manager ranking
            var sorted = Object.keys(scores).sort(function(a, b) {
                return scores[b] - scores[a];
            });
            var bestManagerID = sorted[0];
            // loop through managers in order until currently on-duty manager
            // is found
            var managerID = bestManagerID;
            while (this.isManagerWorking(managerID) && sorted.length > 0) {
                sorted.pop();
                managerID = sorted[0];
            }
            if (sorted.length == 0) {
                // nobody is working, so assign to the most-qualified
                managerID = bestManagerID;
            }
            // assign ticket to said manager
            var error = null;
            done(error, {
                "managerID": managerID,
                "score": scores[managerID],
            });
        },
        /*
         * Given the title and description of the ticket, return an array of
         * ML-useable tokens.
         */
        processTokens: function(title, message) {
            // title is twice as important as the message
            var text = title + " " + title + " " + message;
            text = text.replace(/[^A-Za-z ]/g, " "); // only alphabetic or space
            text = text.replace(/[ ]{2,}/g, " ");    // minimize whitespace
            text = text.replace(/s\b/g, "");         // remove any trailing 's'
            text = text.toLowerCase();               // lowercase
            return text.split(" ");                  // return as array of words
        },
        /*
         * Given data and dataCount, determine each manager's "score". Greater score means
         * more likely to be able to handle ticket
         */
        calcScores: function(tokens, dataCount) {
            var scores = {};
            for (var nameID in dataCount) {
                scores[nameID] = 0;
                var wordCounts = dataCount[nameID]["words"];
                for (var wordID in tokens) {
                    var word = tokens[wordID];
                    scores[nameID] += wordCounts[word] || 0;
                }
                // test without this
                scores[nameID] /= dataCount[nameID]["count"];
            }
            return scores;
        },
        /*
         * Given text data from the ticket and the manager that was assigned
         * manually, adjust the data to represent this preference (legit~ish ML)
         */
        train: function(data, managerID, done) {
            console.log("Training classifier");
            console.log(data, managerID);
            done(null);
        },
        /*
         * Given a manager's ID, determine whether he/she is working now
         */
         isManagerWorking(managerID) {
             // TODO
             return false;
         },
        // /*
        //  * Run some tests to verify the operation of each of the functions.
        //  * This will be removed for production
        //  */
        // conductTest: function() {
        //     var input1 = {
        //         clientEmail: "example@example.com",
        //         title: "Can't connect to polysecure",
        //         text: "I'm having network issues. Would you be able to fix my wifi connection?",
        //     };
        //     this.choose(input1, function(err, result) {
        //         if (err != null) {
        //             console.error("Error during test.", err);
        //             return;
        //         }
        //         console.log(input1, "leads to", result.managerID, result.score);
        //     });
        //     var input2 = {
        //         clientEmail: "example@example.com",
        //         title: "Met with the BSOD",
        //         text: "Computer crashed, I need it for work ASAP. HELP",
        //     };
        //     this.choose(input2, function(err, result) {
        //         if (err != null) {
        //             console.error("Error during test.", err);
        //             return;
        //         }
        //         console.log(input2, "leads to", result.managerID, result.score);
        //     });
        // },
    };
}
