var PATH_DATA_COUNT = "../machineLearning/dataCount.json";
var stopWords = require("./stopWords.json");
var fs = require("fs");
const IDF_WEIGHT = 4;

module.exports = function () {
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
            // get text data and convert it to 'tokens' (list of words)
            var tokens = this.processTokens(data.title, data.text)
            // use dataCount to assess scores
            var dataCount = require(PATH_DATA_COUNT);
            var scores = this.calcScores(tokens, dataCount);
            // list manager ranking
            var sorted = Object.keys(scores).sort(function(a, b) {
                return scores[b] - scores[a];
            });
            // console.log(scores);
            // // Pure-IDF test
            // var scores = this.uniquePerManager(tokens, dataCount);
            // console.log(scores);
            // var sorted = Object.keys(scores).sort(function(a, b) {
            //     return scores[b].length - scores[a].length;
            // });
            // console.log(sorted);

            var bestManagerID = sorted[0];
            // loop through managers in order until currently on-duty manager
            // is found
            var managerID = bestManagerID;
            while (!this.isManagerWorking(managerID) && sorted.length > 0) {
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
        // /*
        //  * Given the ticket's tokens and the count data, find what words appear
        //  * excusively in each manager's corpus
        //  */
        // uniquePerManager: function(tokens, dataCount) {
        //     var unique = {};
        //     for (var tokenID in tokens) {
        //         var managerForToken = -1;
        //         var token = tokens[tokenID];
        //         for (var managerID in dataCount) {
        //             var wordCounts = dataCount[managerID]["words"];
        //             if (wordCounts[token]) {
        //                 if (managerForToken == -1) {
        //                     managerForToken = managerID;
        //                 } else {
        //                     managerForToken = -1;
        //                     break;
        //                 }
        //             }
        //         }
        //         if (managerForToken != -1) { // only one manager has this word
        //             if (unique[managerForToken]) {
        //                 if (unique[managerForToken].indexOf(token) == -1) {
        //                     unique[managerForToken].push(token);
        //                 }
        //             } else {
        //                 unique[managerForToken] = [token];
        //             }
        //         }
        //     }
        //     return unique;
        // },
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
            // remove stopwords
            var tokens = text.split(" ")
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (stopWords.indexOf(token) != -1) {
                    tokens.splice(i, 1);
                    i -= 1;
                }
            }
            return tokens;                           // return as array of words
        },
        /*
         * Given a token and dataCount object, return token's IDF (Inverse
         * document frequency)
         */
        tokenIDF: function(token, dataCount) {
            var count = 0;
            for (var managerID in dataCount) {
                var wordCount = dataCount[managerID]["words"];
                if (wordCount[token]) {
                    count++;
                }
            }
            return count;
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
                    scores[nameID] += (wordCounts[word]
                        * (IDF_WEIGHT / this.tokenIDF(word, dataCount)) )
                        || 0;
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
            var dataCount = require(PATH_DATA_COUNT);
            var words = this.processTokens(data.title, data.text);
            var oldLength = dataCount[managerID]["count"];
            var wordCounts = dataCount[managerID]["words"];
            var newLength = oldLength + words.length;
            var ratio = oldLength / newLength;
            for (var wordID in wordCounts) {
                wordCounts[wordID] *= ratio;
            }
            var add = 1 / newLength;
            for (var wordID in words) {
                var word = words[wordID];
                if (!wordCounts[word]) wordCounts[word] = 0;
                wordCounts[word] += add;
            }

            dataCount[managerID]["count"] = newLength;
            dataCount[managerID]["words"] = wordCounts;
            fs.writeFile(PATH_DATA_COUNT, JSON.stringify(dataCount, null, 4), function(err) {
                if (err) {
                    return done(err);
                }
                console.log("Word count data adjusted.")
                done(null);
            });
        },
        /*
         * Given a manager's ID, determine whether he/she is working now
         * (i.e. they are on schedule and they have not quit)
         */
         isManagerWorking(managerID) {
             // TODO
             return true;
         },
    };
}
