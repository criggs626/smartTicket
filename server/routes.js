const ROOT_DIR = "../frontEnd/";
const HOME = "TicketManagerHome.html";
const LOGIN = "TicketManagerLogin.html";
const INDEX = "SubmitTicket.html";

const DEFAULT_SIZE = 50;


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

    app.get('/get_tickets', function(req, res) {
        var p = parseInt(req.query.page) || 0;
        var s = parseInt(req.query.size) || DEFAULT_SIZE;
        var start = p * s;
        var query = 'SELECT ticket_id as id, title, description, open_status, '
            + 'priority, tickets.department as department, '
            + 'clients.email as client_email, categories.name as category, '
            + 'category as category_id, asignee_id as assignee_ids '
            + 'FROM tickets '
            + 'LEFT JOIN clients ON clients.client_id=tickets.client '
            + 'LEFT JOIN categories ON categories.category_id=tickets.category '
            + 'LIMIT ' + start + ', ' + s + ';'
        mysqlConnection.query(query, function(err, results, fields) {
            if (err) return callback(err, null);
            res.json(results);
        });
    });

    app.post('/submit_ticket', function(req, res) {
        console.log('TODO');
    });

    // make sure that this one is last
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
