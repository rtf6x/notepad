var database = require('database.js');
var settings = require('../config.js');

var dbf = new database(settings);
dbf.open(function (error, database) {
    if (error) {
        console.log(error);
        throw Error("Failed to open database.");
    }

    // Add tokens collection
    database.createCollection('tokens', function (err) {
        if (err) {
            console.log(err);
            throw Error('Failed to create collection "tokens"');
        }

        console.log('Database schema successfully updated');
        return process.exit();
    });
})
;