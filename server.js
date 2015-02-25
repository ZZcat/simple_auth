/** 
 * Module dependencies
 */

var bodyParser = require('body-parser');
var config = require('./config');
var express = require('express');
var fs = require('fs');
var LocalStrategy = require('passport-local').Strategy;
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');

/*
 * Module variables
 */

var app = express();

/**
 * Configure Passport
 */

passport.use(new LocalStrategy(
  function(username, password, done) {
    fs.readFile('passwords.txt', function(err, data) {
      if(err) {
        return done('could not read passwords file');
      }
      var passwords = data.toString();
      var list = passwords.split('\n');
      for(var i=0; i<list.length; i++) {
        var parts = list[i].trim().split(',');
        if(parts.length === 2 && username === parts[0] && password === parts[1]) {
          return done(null, {
            user: username 
          });
        }
      }
      return done('bad username/password');
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var requireAuth = function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.redirect('/');
  }
  return next();
}

/**
 * Middleware
 */

app.use(bodyParser());
app.use(logger('dev'));
app.use(session({
  secret: 'some secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/'
}), function(req, res) {
  return res.redirect('/private');
});

/**
 * Routes 
 */





app.get('/logout', function(req, res){
               req.logout();
               res.redirect('/');
});



app.use('/private', requireAuth, express.static('private'));
app.use(express.static('public'));

/**
 * Start the server
 */

app.listen(config.port, function() {
  console.log('Server started on port ' + config.port + '.');
});
