var express = require('express');
var http = require('http');
var async = require('async');
var cors = require('cors');
var bodyParser = require('body-parser');

var common = require('./common.js');
var database = require('./database.js');
var logger = require('./logger.js');
var settings = require('../config.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.app = express();
exports.app.use(cors());
exports.app.use(bodyParser.json());        // to support JSON-encoded bodies
exports.app.use(bodyParser.urlencoded({    // to support URL-encoded bodies
    extended: true
}));

// exports.app.options('*', cors(), function(){
//     console.log("preflight")
// });

// exports.app.use(function (request, response, next) {
//     response.removeHeader("x-powered-by");
//     response.header("Access-Control-Allow-Origin", settings.CORS_ACAO);
//     response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.addRequestProcessor = function(func){
    exports.app.use(func);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.db = null;
var methodsInfo = {};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
process.on('uncaughtException', function (error) {
    logger.error("Exception: " + error.stack);
    process.exit(-1);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.registerMethod = function (name, schema, impl) {
    if (!methodsInfo.hasOwnProperty(name)) {
        methodsInfo[name] = {};
    }

    methodsInfo[name] = {
        name: name,
        schema: schema,
        impl: impl
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// open database and start the server
exports.run = function (serverName) {
    for (var methodName in methodsInfo) {
        if (methodsInfo.hasOwnProperty(methodName)) {
            var methodInfo = methodsInfo[methodName];
            exports.app.post('/' + methodInfo.name, makeApiCall(methodInfo.schema, methodInfo.impl));
        }
    }

    var dbf = new database(settings);
    dbf.open(function (error, database) {
        if (error) {
            logger.error(error);
            throw Error("Failed to open database.");
        }

        exports.db = database;

        var port = settings.PORT;
        logger.info(serverName + ' server is starting...');
        logger.info('\tport:     ' + port);
        logger.info('\tdatabase: ' + settings.DB_NAME + ' on ' + settings.DB_SERVER + ':' + settings.DB_PORT);
        http.createServer(exports.app).listen(port);
    });
};

var makeApiCall = function (schema, impl) {
    return async.apply(apiCall, function (result, request, callback) {
        async.series([
                async.apply(checkSchema, schema, request),
                async.apply(impl, result, request)
            ],
            callback);
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var apiCall = function (impl, request, response, callback) {
    var startHtime;
    if (process.hrtime) {
        startHtime = process.hrtime();
    } else {
        startHtime = Date.now();
    }

    request.loggerHead = '[' + common.generateObjectID() + '][' + request.url + '] ';
    logger.info(request.loggerHead + 'Started.');

    response.header('content-type', 'application/json');
    var jsonBuilder = require('json-builder');
    var out = jsonBuilder.stream(response);
    out.map().key('result').map();
    impl(out, request, function (error) {
        out.close();

        var status;
        if (!error) {
            status = {error: 'ok', errorMessage: ''};
        } else {
            status = {error: error.type, errorMessage: JSON.stringify(error.message)};
        }

        out.key('status').val(status);
        out.close();
        response.end();

        var statusString;
        if (error) {
            statusString = 'ERROR: ' + status.errorMessage;
        } else {
            statusString = 'Success.';
        }

        var profilingDelta;
        if (process.hrtime) {
            var times = process.hrtime(startHtime);
            profilingDelta = Math.round(times[1] / 1000000);
            profilingDelta += (times[0] * 1000);
        } else {
            profilingDelta = Date.now() - startHtime;
        }
        var zeroPad = 8 - profilingDelta.toString().length;
        for (var i = 0; i < zeroPad; i++) {
            profilingDelta = '0' + profilingDelta;
        }
        logger.info(request.loggerHead + 'Finished. Result: ' + statusString + ' Time: ' + profilingDelta + 'ms');

        if (error) {
            logger.error(request.loggerHead + 'Params: ' + JSON.stringify(request.body));
        }
        callback();
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var checkSchema = function (jsonSchema, request, callback) {
    var schema = require('json-schema');
    if (request.body == null) {
        callback({type: 'invalid_parameter', message: 'Request is empty.'});
        return;
    }
    if (request.body instanceof Array) {
        callback({type: 'invalid_parameter', message: 'Request is Array instead of Object.'});
        return;
    }
    var checkResult = schema.validate(request.body, jsonSchema);
    if (!checkResult.valid) {
        callback({type: 'invalid_parameter', message: checkResult.errors});
        return;
    }
    callback();
};
