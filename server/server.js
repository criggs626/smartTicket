var express = require('express');
var app = express();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var port = /*80 || */8080;

require('./config/passport')(passport);


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
require('./routes.js')(app, passport,express);


app.listen(port, function () {
    console.log('Example app listening on port 80!')
})