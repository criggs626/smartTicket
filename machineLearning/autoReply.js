var lda = require("lda");
const TOPICS_PER_TICKET = 2;
const TERMS_PER_TOPIC = 3;
const RAND_SEED = 42;
const SIMILARITY_THRESHOLD = 0.7;

module.exports = function (mysqlConnection) {
    return {
        /*
         * Given a ticket body string, compare to all FAQs and return a string
         * answer if one is "similar enough"
         */
        getAutoReply: function(ticketData, done) {
            // get lda for ticket data
            var ticketTopics = this.extractTopics(ticketData);
            // for each ticket, get lda
            var _this = this;
            this.loadFAQTickets(function(err, tickets) {
                if (err) done(err);
                var similarities = {};
                for (var ticketID in tickets) {
                    var ticket = tickets[ticketID];
                    var faqTopics = _this.extractTopics(ticket.question);
                    // compare ldas. if they are similar enough,
                    var similarity = _this.similarity(ticketTopics, faqTopics);
                    similarities[ticketID] = similarity;
                }
                // find faq with max similarity. Return the answer.
                var maxID = -1;
                console.log("SIM SIM:", similarities);
                for (var ticketID in similarities) {
                    if (maxID == -1) {
                        maxID = ticketID;
                        continue;
                    }
                    if (similarities[ticketID] > similarities[maxID]) {
                        maxID = ticketID;
                    }
                }
                if (maxID != -1 && similarities[maxID] > SIMILARITY_THRESHOLD) {
                    done(null, tickets[maxID].answer);
                }
            });
            // else return null
            done(null, null);
            console.log('No topics were deemed similar enough. No auto-reply.');

            // TODO save lda because this is repetitive
        },
        /*
         * Given a ticket message string, return the LDA topics
         * [ {
         *     'termA': 0.19,
         *     'termB': 0.15,
         *     ...
         * }, ... ]
         */
        extractTopics: function(ticketData) {
            //var documents = ticketData;
            var documents = ticketData.match( /[^\.!\?]+[\.!\?]+/g );
            var result = lda(documents, TOPICS_PER_TICKET, TERMS_PER_TOPIC,
                null, null, null, RAND_SEED);
            // convert to a data format that I like
            var output = [];
            for (var topicInd in result) {
                var topic = result[topicInd];
                var newTopic = {};
                for (var termInd in topic) {
                    var term = topic[termInd];
                    newTopic[term.term] = term.probability;
                }
                output.push(newTopic);
            }
            return output;
        },
        /*
         * (Asynchronously) return all faq tickets from database
         */
        loadFAQTickets: function(done) {
            var query = "SELECT FAQ_ID, QUESTION, ANSWER FROM FAQ;";
            mysqlConnection.query(query, function(err, results, fields) {
                if (err) {
                    console.error("Failed to load faq tickets.", err);
                    done(err);
                }
                var tickets = [];
                for (var result in results) {
                    tickets.push({
                        id: results[result].FAQ_ID,
                        question: results[result].QUESTION,
                        answer: results[result].ANSWER
                    });
                }
                done(null, tickets);
            });
        },
        /*
         * Given the topic analysis for two tickets, return topic similarity
         * (number of topics in common / number of topics).
         */
        similarity(topicsA, topicsB) {
            // TODO improve. For now, it just naively chooses top word in each
            // topic and makes sure that they each show up in the other topic
            // with only one exception
            if (topicsA.length == 0 || topicsB.length == 0) {
                return false;
            }
            var exceptions = 1;
            var topWordsA = [];
            for (var topicInd in topicsA) {
                var topic = topicsA[topicInd];
                // first value will always be top word
                var keys = Object.keys(topic);
                var word1 = keys[0], word2 = keys[1];
                if (topWordsA.indexOf(word1) == -1) topWordsA.push(word1);
                if (topWordsA.indexOf(word2) == -1) topWordsA.push(word2);
            }
            var topWordsB = [];
            for (var topicInd in topicsB) {
                var topic = topicsB[topicInd];
                // first value will always be top word
                var keys = Object.keys(topic);
                var word1 = keys[0], word2 = keys[1];
                if (topWordsB.indexOf(word1) == -1) topWordsB.push(word1);
                if (topWordsB.indexOf(word2) == -1) topWordsB.push(word2);
            }
            console.log("Comparing:", topWordsA, "to", topWordsB);
            var commonCount = 0;
            for (var wordInd in topWordsA) {
                var word = topWordsA[wordInd];
                if (topWordsB.indexOf(word) > -1) {
                    commonCount++;
                }
            }
            // percentage of how many topics are similar
            return commonCount / Math.min(topWordsA.length, topWordsB.length);
        },
    };
}
