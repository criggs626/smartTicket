const ROOT_DIR = "../frontEnd/";
const LOGIN = "TicketManagerLogin.html";


module.exports = function (app, passport, express) {
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    connection.query('USE smartticket');

//    app.use('/home', isLoggedIn, express.static(ROOT_DIR + '/Home.html'))
    app.use('/login', function (req, res) {
        res.redirect(LOGIN);
    });
    app.use('/', express.static(ROOT_DIR));
//    var path = require('path');
//    app.get('/', function(req, res) {
//        console.log(__dirname);
//        console.log(HOME);
//        res.sendFile(path.join(__dirname + "/" + HOME));
//    });
//    app.post('/insert', function (req, res) {
//        post = {
//            tab: req.body.table,
//            cats: req.body.categories,
//            vals: req.body.values
//        };
//		res.send(post);
//        var catagories;
//        var values="";
//        if (post.cats.length == post.vals.length) {
//            catagories = post.cats.join(",");
//			console.log(parseInt(post.vals[0]));
//            if (isNaN(parseInt(post.vals[0]))) {
//                values +=connection.escape(post.vals[0]) + ',';
//            } else {
//                values += post.vals[0] + ",";
//            }
//            for (i = 1; i < post.vals.length - 1; i++) {
//                if (isNaN(parseInt(post.vals[i]))) {
//                    values += connection.escape(post.vals[i]);
//                } else {
//                    values += post.vals[i];
//                }
//            }
//            if (isNaN(parseInt(post.vals[i]))) {
//                values +=connection.escape(post.vals[i]);
//            } else {
//                values += post.vals[i];
//            }
//            console.log("INSERT INTO " + post.tab + " (" + catagories + ") VALUES(" + values + ");");
//        }
//         if(catagories&&values){
//         connection.query("INSERT INTO "+post.tab+" ("+catagories+") VALUES("+values+");");	
//         }
//    })
//
//    app.post('/login', passport.authenticate('local-login', {
//        successRedirect: ROOT_DIR + '/Home.html', // redirect to the secure profile section
//        failureRedirect: ROOT_DIR + '/TicketManagerLogin.html' // redirect back to the signup page if there is an error
//    }));
//
//    function isLoggedIn(req, res, next) {
//
//        // if user is authenticated in the session, carry on 
//        if (req.isAuthenticated())
//            return next();
//
//        // if they aren't redirect them to the home page
//        res.redirect(HOME);
//    }
//
//    app.get('/logout', function (req, res) {
//        req.logout();
//        res.redirect(HOME);
//    });
}