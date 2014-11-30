var mongoose = require('mongoose');
var crypto = require('crypto');

var linkSchema = mongoose.Schema({
  link: String,
  code: String,
  visits: Number,
  title: String,
  base_url: String,
  url: String
});

var shaHash = function(url){
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0,5);
};

linkSchema.pre('save', function(next){
  this.code = shaHash(this.url);
  next();
})

var Link = mongoose.model('Link', linkSchema);

module.exports = Link;
