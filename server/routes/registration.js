var router = require('express').Router();
var crypto = require('crypto');

router.post('/register', function (req, res) {
  var pass = crypto.createHash('md5').update(req.body.password).digest('hex');
  if (!common.validateEmail(req.body.email)) {
    return res.status(403).json({ status: 'email is invalid' });
  }

  db.collection('users').find({ $or: [{ login: req.body.login }, { email: req.body.email }] }).toArray(function (error, users) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }

    if (users.length) {
      res.status(403).json(errors.entryExistsError);
      return;
    }

    db.collection('users').insertOne({
        '_id': common.generateObjectID(),
        'login': req.body.login,
        'email': req.body.email,
        'password': pass,
        'registerDate': Date.now()
      }, { safe: true },
      function (error) {
        res.status(200).json({ status: 'ok' });
      });
  });
});

module.exports = router;