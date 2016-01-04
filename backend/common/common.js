var ObjectID = require('mongodb').ObjectID;
var logger = require('./logger.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.parseObjectID = function(value) {
  if (!exports.isString(value)){
    return null;
  }
  try {
    return new ObjectID(value);
  }
  catch (error) {
    return null;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.generateObjectID = function() {
    try {
        return new ObjectID();
    }
    catch (error) {
        return null;
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.isString = function(str) {
  return typeof(str) === 'string' || str instanceof String;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};
