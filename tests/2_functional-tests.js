/**
 * ############################################################
 *  Anonymous Message Board - 2024-11-13
 * ############################################################
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    test('1. Creating a new thread: POST request to /api/threads/{board}', function (done) {
        chai
          .request(server)
          .post('/api/threads/news')
          .send({
            "board": "news",
            "text": "Test30",
            "delete_password": "pass1"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            done();
          });
    });

    test('2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function (done) {
        chai
          .request(server)
          .get('/api/threads/news')
          .send({
            "board": "news",
            "text": "Test31",
            "delete_password": "pass1"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
        });
    });

    test('3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
        chai
          .request(server)
          .delete('/api/threads/news')
          .send({
            "board": "news",
            "thread_id": "67328a27c8615693f92742c9",
            "delete_password": "pass2"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
        });
    });

    test('4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function (done) {
        chai
          .request(server)
          .delete('/api/threads/news')
          .send({
            "board": "news",
            "thread_id": "67341e0d2f11b5f38183b337",
            "delete_password": "pass1"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
        });
    });

    test('5. Reporting a thread: PUT request to /api/threads/{board}', function (done) {
        chai
          .request(server)
          .put('/api/threads/news')
          .send({
            "board": "news",
            "thread_id": "673205ec8ba4227bb75b683c"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
        });
    });

    test('6. Creating a new reply: POST request to /api/replies/{board}', function (done) {
      chai
        .request(server)
        .post('/api/replies/news')
        .send({
            "board": "news",
            "thread_id": "67329a2836cd73b2abe6456a",
            "text": "Reply30",
            "delete_password": "pass1"
          })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          done();
      });
    });

    test('7. Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
      chai
        .request(server)
        .get('/api/replies/news?thread_id=67329a2836cd73b2abe6456a')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          done();
      });
    });

    test('8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function (done) {
      chai
        .request(server)
        .delete('/api/replies/news')
        .send({
          "board": "news",
          "thread_id": "67329a2836cd73b2abe6456a",
          "reply_id": "6732fc7195d221a03f59ab78",
          "delete_password": "pass2"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
      });
    });

    test('9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function (done) {
      chai
        .request(server)
        .delete('/api/replies/news')
        .send({
          "board": "news",
          "thread_id": "67329a2836cd73b2abe6456a",
          "reply_id": "6732fc7195d221a03f59ab78",
          "delete_password": "pass1"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
      });
    });

    test('10. Reporting a reply: PUT request to /api/replies/{board}', function (done) {
      chai
        .request(server)
        .put('/api/replies/news')
        .send({
          "board": "news",
          "thread_id": "67329a2836cd73b2abe6456a",
          "reply_id": "6732fb7b9b2975b4645d157e"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
      });
    });

});
