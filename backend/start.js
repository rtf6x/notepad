var server = require('./common/server.js');
var common = require('./common/common.js');
var logger = require('./common/logger.js');
var crypto = require('crypto');
var settings = require('./config.js');
var mailTemplate = require('./common/mail-template/mailTemplate.js');
var fs = require('fs');

// Errors
var internalError = {type: 'internal', message: 'Internal error'};
var entryExistsError = {type: 'entry_exists', message: 'Such entry exists, wow!'};
var notFoundError = {type: 'not_found', message: 'Entry not found'};
var tokenNotFoundError = {type: 'token_not_found', message: 'Token not found'};
var invalidParamError = {type: 'invalid_parameter', message: 'Invalid param given'};

server.addRequestProcessor(function (request, response, next) {
    if ('undefined' == typeof request.body.token) {
        return next();
    }
    var token = common.parseObjectID(request.body.token);
    if (!token) {
        response.status(200).send({status: {error: invalidParamError.type}});
        return;
    }
    server.db.collection('tokens').find({_id: token}).toArray(function (error, tokens) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            response.status(200).send({status: {error: internalError.type}});
            return;
        }
        if (tokens.length != 1) {
            response.status(200).send({status: {error: tokenNotFoundError.type}});
            return;
        }
        request.token = tokens[0];
        return next();
    });
});

server.registerMethod('login', {
    type: "object",
    properties: {
        login: {type: 'string', required: true, minLength: 4},
        password: {type: 'string', required: true, minLength: 4}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var pass = crypto.createHash('md5').update(request.body.password).digest('hex');
    server.db.collection('users').find({
        login: request.body.login,
        password: pass
    }).toArray(function (error, users) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }

        if (users.length != 1) {
            return callback(notFoundError);
        }

        var token = common.generateObjectID();
        server.db.collection('tokens').insertOne({
                '_id': token,
                'userId': users[0]._id,
                'loginDate': Date.now()
            }, {safe: true},
            function (error) {
                result.key('token');
                result.val(token);
                return callback();
            });
    });
});

server.registerMethod('logout', {
    type: "object",
    properties: {
        token: {type: 'string', required: true, minLength: 8}
    },
    additionalProperties: false
}, function (result, request, callback) {
    server.db.collection('tokens').removeOne({
            '_id': request.token._id
        }, {safe: true},
        function (error) {
            return callback();
        });
});

server.registerMethod('register', {
    type: "object",
    properties: {
        login: {type: 'string', required: true, minLength: 4},
        email: {type: 'string', required: true, minLength: 6},
        password: {type: 'string', required: true, minLength: 4}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var pass = crypto.createHash('md5').update(request.body.password).digest('hex');
    if (!common.validateEmail(request.body.email)) {
        return callback(invalidParamError);
    }

    server.db.collection('users').find({$or: [{login: request.body.login}, {email: request.body.email}]}).toArray(function (error, users) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }

        if (users.length) {
            return callback(entryExistsError);
        }

        server.db.collection('users').insertOne({
                '_id': common.generateObjectID(),
                'login': request.body.login,
                'email': request.body.email,
                'password': pass,
                'registerDate': Date.now()
            }, {safe: true},
            function (error) {
                return callback();
            });
    });
});

server.registerMethod('forgotPassword', {
    type: "object",
    properties: {
        login: {type: 'string', required: false, minLength: 4},
        email: {type: 'string', required: false, minLength: 6}
    },
    additionalProperties: false
}, function (result, request, callback) {

    if ('undefined' == typeof request.body.login && 'undefined' == typeof request.body.email) {
        return callback(invalidParamError);
    }

    var searchParams;
    if ('undefined' != typeof request.body.email) {
        if (!common.validateEmail(request.body.email)) {
            return callback(invalidParamError);
        }
        searchParams = {email: request.body.email};
    } else {
        searchParams = {login: request.body.login};
    }
    server.db.collection('users').find(searchParams).toArray(function (error, users) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }

        if (users.length != 1) {
            return callback(notFoundError);
        }

        var user = users[0];
        var randomPass = Math.random().toString(36).slice(2);

        // setup e-mail data with unicode symbols
        var mailOptions = JSON.parse(JSON.stringify(mailTemplate));
        mailOptions.to = user.email;
        mailOptions.text = mailOptions.text.replace('{1}', user.login).replace('{2}', randomPass);
        mailOptions.html = fs.readFileSync('./common/mail-template/mailTemplate.html', { encoding: 'utf8' }).replace('{1}', user.login).replace('{2}', randomPass);

        // send mail with defined transport object
        settings.MAIL_TRANSPORT.sendMail(mailOptions, function(error, info){
            if (error){
                logger.error('Nodemailer error: ' + error.toString());
                return callback(internalError);
            }

            randomPass = crypto.createHash('md5').update(randomPass).digest('hex');
            server.db.collection('users').updateOne(
                {'_id': user._id, 'login': user.login, 'email': user.email},
                {$set: {password: randomPass}},
                {safe: true},
                function (error) {
                    return callback();
                });
        });

    });
});

server.registerMethod('getNotesList', {
    type: "object",
    properties: {
        token: {type: 'string', required: true, minLength: 8}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var userId = request.token.userId;
    server.db.collection('notes').find({userId: userId}, {
        note: 0,
        userId: 0
    }).sort({date: -1}).toArray(function (error, notes) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }

        result.key('notes');
        result.val(notes);
        return callback();
    });
});

server.registerMethod('loadNote', {
    type: 'object',
    properties: {
        token: {type: 'string', required: true, minLength: 8},
        noteId: {type: 'string', required: true, minLength: 8}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var noteId = common.parseObjectID(request.body.noteId);
    if (!noteId) {
        return callback(invalidParamError);
    }

    var userId = request.token.userId;
    server.db.collection('notes').find({_id: noteId, userId: userId}).toArray(function (error, notes) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }

        if (!notes.length) {
            return callback(notFoundError);
        }

        result.key('note');
        result.val(notes[0]);
        return callback();
    });
});

server.registerMethod('addNote', {
    type: 'object',
    properties: {
        token: {type: 'string', required: true, minLength: 8}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var userId = request.token.userId;
    server.db.collection('notes').insertOne({
        'userId': userId,
        '_id': common.generateObjectID(),
        'title': '',
        'note': '',
        'date': Date.now()
    }, {safe: true},
    function (error) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }
        result.key('status');
        result.val('ok');
        return callback();
    })
});

server.registerMethod('updateNote', {
    type: 'object',
    properties: {
        token: {type: 'string', required: true, minLength: 8},
        noteId: {type: 'string', required: true, minLength: 8},
        title: {type: 'string', required: true, minLength: 1},
        note: {type: 'string', required: true}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var noteId = common.parseObjectID(request.body.noteId);
    if (!noteId) {
        return callback(invalidParamError);
    }

    var title = request.body.title;
    var noteText = request.body.note;

    var userId = request.token.userId;
    server.db.collection('notes').find({_id: noteId, userId: userId}).toArray(function (error, notes) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }
        if (notes.length != 1) {
            return callback(notFoundError);
        }

        server.db.collection('notes').updateOne(
            {_id: noteId, userId: userId},
            {$set: {title: title, note: noteText, date: Date.now()}},
            {multi: false, upsert: false}, function (error) {
                if (error) {
                    logger.error('Mongo error: ' + error.toString());
                    return callback(internalError);
                }

                result.key('status');
                result.val('ok');
                return callback();
            });
    });
});

server.registerMethod('updateNoteTitle', {
    type: 'object',
    properties: {
        token: {type: 'string', required: true, minLength: 8},
        noteId: {type: 'string', required: true, minLength: 8},
        title: {type: 'string', required: true, minLength: 1}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var noteId = common.parseObjectID(request.body.noteId);
    if (!noteId) {
        return callback(invalidParamError);
    }

    var title = request.body.title;


    var userId = request.token.userId;
    server.db.collection('notes').find({_id: noteId, userId: userId}).toArray(function (error, notes) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }
        if (notes.length != 1) {
            return callback(notFoundError);
        }

        server.db.collection('notes').updateOne(
            {_id: noteId, userId: userId},
            {$set: {title: title, date: Date.now()}},
            {multi: false, upsert: false}, function (error) {
                if (error) {
                    logger.error('Mongo error: ' + error.toString());
                    return callback(internalError);
                }

                result.key('status');
                result.val('ok');
                return callback();
            });
    });
});

server.registerMethod('removeNote', {
    type: 'object',
    properties: {
        token: {type: 'string', required: true, minLength: 8},
        noteId: {type: 'string', required: true, minLength: 8}
    },
    additionalProperties: false
}, function (result, request, callback) {
    var noteId = common.parseObjectID(request.body.noteId);
    if (!noteId) {
        return callback(invalidParamError);
    }

    var userId = request.token.userId;
    server.db.collection('notes').findOneAndDelete({
        _id: noteId,
        userId: userId
    }, {safe: true}, function (error, removedCount) {
        if (error) {
            logger.error('Mongo error: ' + error.toString());
            return callback(internalError);
        }
        if (!removedCount) {
            return callback(notFoundError);
        }
        result.key('status');
        result.val('ok');
        return callback();
    });
});

server.run('notepad', true);
