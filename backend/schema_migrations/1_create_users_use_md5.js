var database = require('database.js');
var async = require('async');
var crypto = require('crypto');
var settings = require('../config.js');

var dbf = new database(settings);
dbf.open(function (error, database) {
    if (error) {
        console.log(error);
        throw Error("Failed to open database.");
    }

    // Add users collection
    database.createCollection('users', function (err, usersCollection) {
        if (err) {
            console.log(err);
            throw Error('Failed to create collection "users"');
        }

        // update users (password > hash)
        database.collection('users').find().toArray(function (err, users) {
            if (err) {
                console.log(err);
                throw Error('Failed to find in users');
            }

            async.eachSeries(users, function (user, callback) {
                user.password = crypto.createHash('md5').update(user.password).digest('hex');
                database.collection('users').updateOne({_id: user._id}, user, function (err, user) {
                    if (err) {
                        console.log(err);
                        throw Error('Failed to update users');
                    }
                    callback();
                });
            }, function () {
                console.log('Database schema successfully updated');
                return process.exit();
            });

        });
    });
})
;