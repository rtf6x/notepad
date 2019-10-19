var express = require('express'),
  http = require('http'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  MongoClient = require('mongodb').MongoClient;

global.settings = require('./config');
global.errors = require('./common/errors');
global.common = require('./common/common');
global.logger = require('./common/logger');

var routes = require('./routes');

var app = express();

MongoClient.connect(
  'mongodb://' + settings.DB_USER + ':' + settings.DB_PASSWORD + '@' + settings.DB_SERVER + ':' + settings.DB_PORT + '/' + settings.DB_NAME + '?w=1&journal=false&fsync=true&safe=true',
  { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true },
  (err, client) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    global.db = client.db('skinswipe_prod');
    console.log('Connected to Mongo');
  }
);

app.use('/', express.static(__dirname + '/../client/'));
app.get('/', function (req, res) {
  res.redirect('index.html');
});

app.use(morgan('common'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));

app.use(function (req, res, next) {
  if (!req.body || !req.body.token) {
    return next();
  }
  var token = common.parseObjectID(req.body.token);
  if (!token) {
    res.status(403).json(errors.invalidParamError);
    return;
  }
  db.collection('tokens').find({ _id: token }).toArray(function (error, tokens) {
    if (error) {
      logger.error('Mongo error: ' + error.toString());
      res.status(502).json(errors.internalError);
      return;
    }
    if (tokens.length != 1) {
      res.status(403).json(errors.tokenNotFoundError);
      return;
    }
    req.token = tokens[0];
    return next();
  });
});

app.use('/api', routes);

app.on('error', (error) => {
  logger.error('API Server error:', error);
});

var server = http.createServer(app);
server.listen(settings.PORT, () => {
  logger.info(`API server is listening at ${settings.PORT}`);
});
