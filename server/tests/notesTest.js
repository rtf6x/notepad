var common = require("../common/common.js");
var request = require('supertest');
var should = require('should');
var database = require('../common/database.js');
var settings = require('../config.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

request = request('http://127.0.0.1:' + settings.PORT);

var validTestUser = {
    login: 'test12345',
    email: 'strangefoxes@gmail.com',
    password: 'test12345'
};
var token;
var userId;
var notes = [];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('notesTest', function () {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    before(function (done) {
        done();
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    after(function (done) {
        var dbf = new database(settings);
        dbf.open(function (error, database) {
            should.not.exist(error);
            database.collection('users').removeOne({login: validTestUser.login}, function (error) {
                should.not.exist(error);
                database.collection('notes').removeMany({userId: userId}, function (error) {
                    should.not.exist(error);
                    done();
                });
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('register', function () {

        it('login error', function (done) {
            request.post('/register')
                .send({
                    email: 'test1@test.tr',
                    password: 'test123'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('login error', function (done) {
            request.post('/register')
                .send({
                    login: '',
                    email: 'test1@test.tr',
                    password: 'test123'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('email error', function (done) {
            request.post('/register')
                .send({
                    login: 'test12345',
                    password: 'test123'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('email error', function (done) {
            request.post('/register')
                .send({
                    login: 'test12345',
                    email: 'test1test.tr',
                    password: 'test123'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('pass error', function (done) {
            request.post('/register')
                .send({
                    login: 'test12345',
                    email: 'test1@test.tr'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('pass error', function (done) {
            request.post('/register')
                .send({
                    login: 'test12345',
                    email: 'test1@test.tr',
                    password: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should register', function (done) {

            request.post('/register')
                .send(validTestUser)
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);

                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('login', function () {
        it('should return error', function (done) {
            request.post('/login')
                .send({
                    login: '',
                    password: validTestUser.password
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/login')
                .send({
                    login: 'adsfasdfdf',
                    password: validTestUser.password
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'not_found');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/login')
                .send({
                    password: validTestUser.password
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/login')
                .send({
                    login: validTestUser.login,
                    password: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/login')
                .send({
                    login: validTestUser.login,
                    password: 'asdfadsfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'not_found');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/login')
                .send({
                    login: validTestUser.login
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should login', function (done) {
            request.post('/login')
                .send({
                    login: validTestUser.login,
                    password: validTestUser.password
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('token');
                    token = response.body.result.token;

                    // get userId
                    var dbf = new database(settings);
                    dbf.open(function (error, database) {
                        should.not.exist(error);
                        var userToken = common.parseObjectID(token);
                        database.collection('tokens').find({_id: userToken}).toArray(function (error, tokens) {
                            should.not.exist(error);
                            tokens.should.have.length(1);
                            userId = tokens[0].userId;
                            done();
                        });
                    });
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('forgotPassword', function () {
        it('should return error', function (done) {
            request.post('/forgotPassword')
                .send({
                    login: validTestUser.login + '=-!_.sd/asd'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'not_found');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/forgotPassword')
                .send({
                    email: validTestUser.email + '=-!_.sd/asd'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should send pass to email', function (done) {
            request.post('/forgotPassword')
                .send({
                    email: validTestUser.email
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.eql({});
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('login', function () {
        it('should return error after password update', function (done) {
            request.post('/login')
                .send({
                    login: validTestUser.login,
                    password: validTestUser.password
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'not_found');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('getNotesList', function () {
        it('should return error', function (done) {
            request.post('/getNotesList')
                .send({
                    token: validTestUser.login
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/getNotesList')
                .send({
                    token: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/getNotesList')
                .send({})
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return empty notes list', function (done) {
            request.post('/getNotesList')
                .send({
                    token: token
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('notes').with.lengthOf(0);
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('addNote', function () {
        it('should return error', function (done) {
            request.post('/addNote')
                .send({
                    token: validTestUser.login
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/addNote')
                .send({
                    token: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/addNote')
                .send({})
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should add note', function (done) {
            request.post('/addNote')
                .send({
                    token: token
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('status', 'ok');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('getNotesList', function () {
        it('should return error', function (done) {
            request.post('/getNotesList')
                .send({
                    token: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/getNotesList')
                .send({})
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return notes list with length of 1', function (done) {
            request.post('/getNotesList')
                .send({
                    token: token
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('notes').with.lengthOf(1);
                    notes = response.body.result.notes;
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('loadNote', function () {
        it('should return error', function (done) {
            request.post('/loadNote')
                .send({
                    token: '',
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/loadNote')
                .send({
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/loadNote')
                .send({
                    token: token,
                    noteId: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/loadNote')
                .send({
                    token: token
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should load note', function (done) {
            request.post('/loadNote')
                .send({
                    token: token,
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('note');
                    response.body.result.note.should.have.property('title', '');
                    response.body.result.note.should.have.property('note', '');
                    response.body.result.note.should.have.property('userId', userId.toString());
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('updateNote', function () {
        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    noteId: notes[0]._id,
                    title: 'qewrqwer',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    title: 'qewrqwer',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: '',
                    noteId: notes[0]._id,
                    title: 'qewrqwer',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: '',
                    title: 'qewrqwer',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    title: '',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: 'adsfadsfad',
                    noteId: notes[0]._id,
                    title: 'qewrqwer',
                    note: 'asdfadsf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: 'asdfasdfadsfa',
                    title: 'qewrqwer',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    title: 1,
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    title: 'qewrqwer',
                    note: 1
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: 1,
                    title: 'qewrqwer',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should update note', function (done) {
            request.post('/updateNote')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    title: 'qewrqwer',
                    note: 'asdfasdf'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('loadNote', function () {
        it('should return note', function (done) {
            request.post('/loadNote')
                .send({
                    token: token,
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('note');
                    response.body.result.note.should.have.property('title', 'qewrqwer');
                    response.body.result.note.should.have.property('note', 'asdfasdf');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('updateNoteTitle', function () {
        it('should return error', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    noteId: notes[0]._id,
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    token: token,
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    token: '',
                    noteId: notes[0]._id,
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    token: token,
                    noteId: '',
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    token: 1,
                    noteId: notes[0]._id,
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    token: token,
                    noteId: 1,
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    title: 1
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should update note title', function (done) {
            request.post('/updateNoteTitle')
                .send({
                    token: token,
                    noteId: notes[0]._id,
                    title: 'qewrqwer'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('loadNote', function () {
        it('should load updated note', function (done) {
            request.post('/loadNote')
                .send({
                    token: token,
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('note');
                    response.body.result.note.should.have.property('title', 'qewrqwer');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('removeNote', function () {
        it('should return error', function (done) {
            request.post('/removeNote')
                .send({
                    token: '',
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });
        it('should return error', function (done) {
            request.post('/removeNote')
                .send({
                    token: token,
                    noteId: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });
        it('should return error', function (done) {
            request.post('/removeNote')
                .send({
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });
        it('should return error', function (done) {
            request.post('/removeNote')
                .send({
                    token: token
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });
        it('should return error', function (done) {
            request.post('/removeNote')
                .send({
                    token: 'sdfgsdgfdsgs',
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'token_not_found');
                    done();
                });
        });
        it('should return error', function (done) {
            request.post('/removeNote')
                .send({
                    token: token,
                    noteId: 'sdfgdfsgdfgdfg'
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should remove note', function (done) {
            request.post('/removeNote')
                .send({
                    token: token,
                    noteId: notes[0]._id
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('getNotesList', function () {
        it('should return empty notes list', function (done) {
            request.post('/getNotesList')
                .send({
                    token: token
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.have.property('notes').with.lengthOf(0);
                    done();
                });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    describe('logout', function () {
        it('should return error', function (done) {
            request.post('/logout')
                .send({
                    token: validTestUser.login
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/logout')
                .send({
                    token: ''
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should return error', function (done) {
            request.post('/logout')
                .send({})
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'invalid_parameter');
                    done();
                });
        });

        it('should remove used token', function (done) {
            request.post('/logout')
                .send({
                    token: token
                })
                .expect(200)
                .end(function (error, response) {
                    should.not.exist(error);
                    response.body.should.have.property('status');
                    response.body.status.should.have.property('error', 'ok');
                    response.body.should.have.property('result');
                    response.body.result.should.eql({});
                    done();
                });
        });
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////