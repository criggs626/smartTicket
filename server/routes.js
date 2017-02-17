const ROOT_DIR = "../frontEnd/";
const HOME = "TicketManagerHome.html";
const LOGIN = "TicketManagerLogin.html";
const INDEX = "SubmitTicket.html";


module.exports = function (app, passport, express, mysqlConnection) {
    var path = require('path');

    app.use(express.static(ROOT_DIR));
    app.use('/home', isLoggedIn, function (req, res) {
        send(res, HOME);
    });

    app.get('/login', function (req, res) {
        send(res, LOGIN);
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/' // redirect back to the signup page if there is an error
    }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect("/");
    });
    app.post('/insert', function (req, res) {
        post = {
            tab: req.body.table,
            cats: req.body.categories,
            vals: req.body.values
        };
		res.send(post);
        var catagories;
        var values="";
        if (post.cats.length == post.vals.length) {
            catagories = post.cats.join(",");
			console.log(parseInt(post.vals[0]));
            if (isNaN(parseInt(post.vals[0]))) {
                values += mysqlConnection.escape(post.vals[0]) + ',';
            } else {
                values += post.vals[0] + ",";
            }
            for (i = 1; i < post.vals.length - 1; i++) {
                if (isNaN(parseInt(post.vals[i]))) {
                    values += mysqlConnection.escape(post.vals[i]);
                } else {
                    values += post.vals[i];
                }
            }
            if (isNaN(parseInt(post.vals[i]))) {
                values += mysqlConnection.escape(post.vals[i]);
            } else {
                values += post.vals[i];
            }
            console.log("INSERT INTO " + post.tab + " (" + catagories + ") VALUES(" + values + ");");
        }
         if (catagories && values) {
             mysqlConnection.query("INSERT INTO "+post.tab+" ("+catagories+") VALUES("+values+");");
         }
    });
    app.use('/', function (req, res) {
        send(res, INDEX);
    });

    function isLoggedIn(req, res, next) {
        // return next();
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect("/");
    }

    function send(request, file) {
        request.sendFile(path.join(__dirname, ROOT_DIR, file));
    }
}
