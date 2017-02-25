module.exports = function (mysqlConnection) {
    return {
        choose: function(data, done) {
            // TODO: add actual machine learning stuff. For now, it's just 0
            console.log("TODO: actually use machine learning to decide")
            var randNum = Math.floor(Math.random() * 6);
            if (randNum == 0) {
                done(null, -1);
            } else {
                done(null, randNum);
            }
            return;
        }
    };
}
