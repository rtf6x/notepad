var database = require('database.js');
var common = require('common.js');
var settings = require('../config.js');

var dbf = new database(settings);
dbf.open(function (error, database) {
  if (error) {
    console.log(error);
    throw Error("Failed to open database.");
  }

  database.createCollection('notes', function (err, notesCollection) {
    if (err) {
      console.log(err);
      throw Error('Failed to create collection "notes"');
    }

    notesCollection.insert({
        'userId': common.generateObjectID(),
        'date': Date.now(),
        'title': 'Note name',
        'note': 'asdfsadvxcvzxcvzxcvzcxvzcxv test \ntest test'
      }, {safe: true},
      function (err, insertedValues) {
        if (err) {
          console.log(err);
          throw Error('Failed to insert note');
        }

        console.log('Database schema successfully updated');
        return process.exit();
      });
  });
})
;