var routes = require('express').Router();

var authorization = require('./authorization');
var registration = require('./registration');
var notes = require('./notes');

// const routes = Router({
//   prefix: '/api'
// });

routes.use(authorization);
routes.use(registration);
routes.use(notes);

module.exports = routes;
