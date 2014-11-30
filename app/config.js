var path = require('path');
var mongoose = require('mongoose');

var mongoURI = 'mongodb://localhost/shortlydb';
mongoose.connect(mongoURI);

var db = mongoose.connection;

db.on('error', console.error.bind(console,'connection error:'));
db.once('open', function callback(){
  console.log('Successfully connected to MongoDB');
});

module.exports = db;
