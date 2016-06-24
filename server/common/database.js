var MongoClient = require('mongodb').MongoClient;
var logger = require('./logger.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var DBFactory = function (dbSettings) {
    var mongo = null;
    this.open = function (callback) {
        var dbAddress;
        if (!dbSettings) {
            return callback('Tried to establish connection to DB without config.');
        }
        dbAddress = 'mongodb://' + dbSettings.DB_USER + ':' + dbSettings.DB_PASSWORD + '@' + dbSettings.DB_SERVER + ':' + dbSettings.DB_PORT + '/' + dbSettings.DB_NAME + '?w=1&journal=false&fsync=true&safe=true';
        MongoClient.connect(dbAddress, function (err, db) {
            if (err || !db) {
                logger.error('Mongo connection error: ' + err.toString());
            }
            mongo = db;
            callback(err, db);
        });
    };
    this.close = function (callback) {
        if (mongo) {
            mongo.close(function (err, result) {
                callback(err, result);
            });
        } else {
            callback('No connection.');
        }
    };
    return this;
};

module.exports = DBFactory;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
