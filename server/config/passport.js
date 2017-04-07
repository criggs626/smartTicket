// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

var md5 = require('md5');

// expose this function to our app using module.exports
module.exports = function(mysqlConnection, passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.USER_ID);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        mysqlConnection.query("SELECT * FROM USERS WHERE USER_ID = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

         mysqlConnection.query("SELECT * FROM USERS WHERE WORK_EMAIL = '" + email + "'", function(err,rows) {
			if (err)
                return done(err);
			 if (!rows.length) {
                return done(null, false, console.log("no user found")); // req.flash is the way to set flashdata using connect-flash
            }

			// if the user is found but the password, check if the password is wrong
            if (!( rows[0]["PASSWORD"].toString().substring(0, 32) == md5(password)))
                return done(null, false, console.log("Wrong Password")); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, rows[0]);
		});
    }));
};
