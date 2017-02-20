module.exports = function (mysqlConnection) {
    return {
        choose: function(data) {
            // TODO: add actual machine learning stuff. For now, it's just 0
            console.log("TODO: actually use machine learning to decide")
            return 0;
        }
    };
}
