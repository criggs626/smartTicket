var express = require('express');
var app = express();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var config = require('../config.json');
var replace = require("replace");


// initialize the MySQL database connection
var mysqlConnection = mysql.createConnection({
	host: 'localhost',
	user: config['mysql-username'] || 'root',
	password: config['mysql-password'] || ''
});
mysqlConnection.query('USE smartticket;');


require('./config/passport')(mysqlConnection, passport);

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } ));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('./routes.js')(app, passport, express, mysqlConnection,replace);

var port = parseInt(config['port']) || 80;
app.listen(port, function () {
    console.log('Example app listening on port %d!', port);
});
