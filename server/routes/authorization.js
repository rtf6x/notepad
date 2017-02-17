var router = require('express').Router();
var crypto = require('crypto');
var fs = require('fs');
var mailTemplate = require('../common/mail-template/mailTemplate.js');

// todo: add json-schema

router.post('/login', function (req, res) {
  if (!req.body || !req.body.password){
    res.status(403).json(errors.invalidParamError);
    return;
  }
  var pass = crypto.createHash('md5').update(req.body.password).digest('hex');
  db.collection('users').find({
    login: req.body.login,
    password: pass
  }).toArray(function (error, users) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    } else if (users.length != 1) {
      res.status(403).json(errors.notFoundError);
      return;
    }
    const token = common.generateObjectID();
    db.collection('tokens').insertOne({
        '_id': token,
        'userId': users[0]._id,
        'loginDate': Date.now()
      }, { safe: true },
      function (error) {
        if (error) {
          logger.error('Mongo error: ' + error.toString());
          res.status(502).json(errors.internalError);
          return;
        }
        res.status(200).json({ token: token });
      });
  });
});

router.post('/logout', function (req, res) {
  db.collection('tokens').removeOne({
      '_id': req.token._id
    }, { safe: true },
    function (error) {
      res.status(200).json({ status: 'ok' });
    });
});

router.post('/forgotPassword', function (req, res) {
  if ('undefined' == typeof req.body.login && 'undefined' == typeof req.body.email) {
    res.status(403).json(errors.invalidParamError);
    return;
  }
  var searchParams;
  if ('undefined' != typeof req.body.email) {
    if (!common.validateEmail(req.body.email)) {
      res.status(403).json(errors.invalidParamError);
      return;
    }
    searchParams = { email: req.body.email };
  } else {
    searchParams = { login: req.body.login };
  }
  db.collection('users').find(searchParams).toArray(function (error, users) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }

    if (users.length != 1) {
      res.status(502).json(errors.internalError);
      return;
    }

    var user = users[0];
    var randomPass = Math.random().toString(36).slice(2);

    // setup e-mail data with unicode symbols
    var mailOptions = JSON.parse(JSON.stringify(mailTemplate));
    mailOptions.to = user.email;
    mailOptions.text = mailOptions.text.replace('{1}', user.login).replace('{2}', randomPass);
    mailOptions.html = fs.readFileSync(__dirname + '/../common/mail-template/mailTemplate.html', { encoding: 'utf8' }).replace('{1}', user.login).replace('{2}', randomPass);

    res.status(200).json({ status: 'ok' });
    // send mail with defined transport object
    // settings.MAIL_TRANSPORT.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     logger.error('Nodemailer error: ' + error.toString());
    //     res.status(502).json(errors.internalError);
    //     return;
    //   }
    //
    //   randomPass = crypto.createHash('md5').update(randomPass).digest('hex');
    //   db.collection('users').updateOne(
    //     { '_id': user._id, 'login': user.login, 'email': user.email },
    //     { $set: { password: randomPass } },
    //     { safe: true },
    //     function (error) {
    //       res.status(200).json({ status: 'ok' });
    //     });
    // });
  });
});

module.exports = router;