var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}).exec(function(err, links){
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
  Link.findOne({ url: uri }, function(err, found){
    if (found) { return res.send(found);}
    else {
      util.getUrlTitle(uri, function(err, title){
        if (err) {
          console.log('Error reading URL heading:', err)
          return res.send(err);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          visits: 0
        });
        newLink.save(function(err, success){
          if (err) { return res.send(err); }
          else { return res.send(success); }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username:username}, function(err, found){
    if (err) { return res.send(err); }
    else if (!found) { return res.redirect('/login'); }
    else {
      User.comparePassword(password, found.password, function(err, match){
        if (match) {
          return util.createSession(req, res, found);
        } else {
          return res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, found){
    if (err) { return res.send(err); }
    else {
      if(!found){
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(err, result){
          if (err) { return res.send(500, err); }
          util.createSession(req, res, result);
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0]}, function(err, link){
    if (!link) {
      res.redirect('/');
    } else {
      link.visit++;
      link.save(function(err,link){
        res.redirect(link.url);
        return;
      });
    }
  });
};