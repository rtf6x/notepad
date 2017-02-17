var router = require('express').Router();

router.post('/getNotesList', function (req, res) {
  var userId = req.token.userId;
  db.collection('notes').find({ userId: userId }, {
    note: 0,
    userId: 0
  }).sort({ date: -1 }).toArray(function (error, notes) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }
    res.status(200).json({ notes: notes });
  });
});

router.post('/loadNote', function (req, res) {
  var noteId = common.parseObjectID(req.body.noteId);
  if (!noteId) {
    res.status(403).json(errors.invalidParamError);
    return;
  }
  var userId = req.token.userId;
  db.collection('notes').find({ _id: noteId, userId: userId }).toArray(function (error, notes) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }

    if (!notes.length) {
      res.status(403).json(errors.notFoundError);
      return;
    }
    res.status(200).json({ note: notes[0] });
  });
});

router.post('/addNote', function (req, res) {
  var userId = req.token.userId;
  db.collection('notes').insertOne({
      'userId': userId,
      '_id': common.generateObjectID(),
      'title': '',
      'note': '',
      'date': Date.now()
    }, { safe: true },
    function (error) {
      if (error) {
        logger.error('Mongo error: ' + error.toString());
        res.status(502).json(errors.internalError);
        return;
      }
      res.status(200).json({ status: 'ok' });
    })
});

router.post('/updateNote', function (req, res) {
  var noteId = common.parseObjectID(req.body.noteId);
  if (!noteId) {
    res.status(403).json(errors.invalidParamError);
    return;
  }

  var title = req.body.title;
  var noteText = req.body.note;

  var userId = req.token.userId;
  db.collection('notes').find({ _id: noteId, userId: userId }).toArray(function (error, notes) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }
    if (notes.length != 1) {
      res.status(403).json(errors.notFoundError);
      return;
    }

    db.collection('notes').updateOne(
      { _id: noteId, userId: userId },
      { $set: { title: title, note: noteText, date: Date.now() } },
      { multi: false, upsert: false }, function (error) {
        if (error) {
          logger.error('Mongo error: ' + error.toString());
          res.status(502).json(errors.internalError);
          return;
        }
        res.status(200).json({ status: 'ok' });
      });
  });
});

router.post('/updateNoteTitle', function (req, res) {
  var noteId = common.parseObjectID(req.body.noteId);
  if (!noteId) {
    res.status(403).json(errors.invalidParamError);
    return;
  }
  var title = req.body.title;
  var userId = req.token.userId;
  db.collection('notes').find({ _id: noteId, userId: userId }).toArray(function (error, notes) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }
    if (notes.length != 1) {
      res.status(403).json(errors.notFoundError);
      return;
    }

    db.collection('notes').updateOne(
      { _id: noteId, userId: userId },
      { $set: { title: title, date: Date.now() } },
      { multi: false, upsert: false }, function (error) {
        if (error) {
          logger.error('Mongo error: ' + error.toString());
          res.status(502).json(errors.internalError);
          return;
        }
        res.status(200).json({ status: 'ok' });
      });
  });
});

router.post('/removeNote', function (req, res) {
  var noteId = common.parseObjectID(req.body.noteId);
  if (!noteId) {
    res.status(403).json(errors.invalidParamError);
    return;
  }

  var userId = req.token.userId;
  db.collection('notes').findOneAndDelete({
    _id: noteId,
    userId: userId
  }, { safe: true }, function (error, removedCount) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }
    if (!removedCount) {
      res.status(403).json(errors.notFoundError);
      return;
    }
    res.status(200).json({ status: 'ok' });
  });
});

module.exports = router;