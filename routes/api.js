/**
 * ############################################################
 *  Anonymous Message Board - 2024-11-13
 * ############################################################
 */

'use strict';

const Board  = require('../models.js').Board;
const Thread = require('../models.js').Thread;
const Reply  = require('../models.js').Reply;

module.exports = function (app) {
  
  app.route('/api/threads/:board')

    .post(async function (req, res){

      const board = req.params.board;
      const text = req.body.text;
      const delete_password = req.body.delete_password;
      let new_thread;
      let message_board;

      try {
        // Create a new thread
        new_thread = new Thread({
          text: text,
          delete_password: delete_password
        });

        // Find the existing board in the database
        message_board = await Board.findOne({name: board});

        // If the board hasn't created yet
        if (!message_board) {
          message_board = new Board({
            name: board,
            threads: [new_thread]
          });
          await message_board.save();

        // The board already exists in the database
        } else {
          message_board.threads.push(new_thread);
          await Board.updateOne({name: board}, {
            $set: {
              threads: message_board['threads']
            }
          });

        }

        // Redirect to the Board page
        return res.redirect(301, `/b/${board}/`);

      } catch (err) {
        console.log(err);
      }

    })  // .post(async function (req, res)

    .get(async function (req, res){

      const board = req.params.board;
      let message_board;
      let threads;
      let sorted_threads;
      let res_threads;
      
      try {
        // Find all threads of the board in the database
        message_board = await Board.findOne({name: board});
        threads = message_board['threads'];

        // Sort the array by the bumped_on date
        sorted_threads = threads.sort((a, b) => b['bumped_on'] - a['bumped_on']);

        // Select the most recent 10 threads
        sorted_threads = sorted_threads.slice(0, 10);

        // Remove reported and delete_password, then add replycount
        res_threads = sorted_threads.map((thread) => {
          const {
            _id,
            text,
            created_on,
            bumped_on,
            reported,
            delete_password,
            replies} = thread;
          return {
            _id,
            text,
            created_on,
            bumped_on,
            replies,
            replycount: thread['replies'].length
          };
        });

        // Clean up the replies in each thread
        for (let i = 0; i < res_threads.length; i++) {

          // Select the most recent 3 replies in each thread
          res_threads[i]['replies'] = res_threads[i]['replies'].slice(-3,);

          // Remove reported and delete_password from each reply
          const replies = res_threads[i]['replies'].map((reply) => {
            const {
              _id,
              text,
              created_on,
              bumped_on,
              reported,
              delete_password
            } = reply;
            return {
              _id,
              text,
              created_on,
              bumped_on
            };
          });

          res_threads[i]['replies'] = replies;
        }

        return res.json(res_threads);

      } catch (err) {
        console.log(err);
      }  

    })  // .get(async function (req, res)

    .delete(async function (req, res){

      const board = req.params.board;
      const thread_id = req.body.thread_id;
      const delete_password = req.body.delete_password;
      let message_board;
      let index;
      let is_correct_pwd = false;

      try {
        // Find the existing board in the database
        message_board = await Board.findOne({name: board});
        
        for (let i = 0; i < message_board['threads'].length; i++) {
          if (message_board['threads'][i]['_id'] == thread_id) {
            if (message_board['threads'][i]['delete_password'] == delete_password) {
              index = i;
              is_correct_pwd = true;
            }
            break;
          }
        }

        if (is_correct_pwd) {
          message_board['threads'].splice(index, 1);

          // Update the message board in the database
          await Board.updateOne({name: board}, {
            $set: {
              threads: message_board['threads']
            }
          });

          return res.send('success');

        } else {
          return res.send('incorrect password');
        }

      } catch (err) {
        console.log(err);
      }

    })  // .delete(async function (req, res)

    .put(async function (req, res){

      const board = req.params.board;
      const thread_id = req.body.thread_id;
      let message_board;
      let is_reported = false;

      try {
        // Find the requested board in the database
        message_board = await Board.findOne({name: board});

        // Find the thread by id and update reported to true
        for (let i = 0; i < message_board['threads'].length; i++) {
          if (message_board['threads'][i]['_id'] == thread_id) {
            message_board['threads'][i]['reported'] = true;
            is_reported = true;
            break;
          }
        }

        if (is_reported) {
          // Update the message board in the database
          await Board.updateOne({name: board}, {
            $set: {
              threads: message_board['threads']
            }
          });

          return res.send('reported');

        }

      } catch (err) {
        console.log(err);
      }

    })  // .put(async function (req, res)

    
  app.route('/api/replies/:board')
    
    .post(async function (req, res){

      const board = req.params.board;
      const thread_id = req.body.thread_id;
      const text = req.body.text;
      const delete_password = req.body.delete_password;
      const date = new Date();
      let message_board;

      const reply = new Reply({
        text: text,
        created_on: date,
        bumped_on: date,
        delete_password: delete_password
      });
      
      try {
        // Find the requested board in the database
        message_board = await Board.findOne({name: board});

        // Add the new reply to the thread and update bumped_on date
        for (let i = 0; i < message_board['threads'].length; i++) {
          if (message_board['threads'][i]['_id'] == thread_id) {
            message_board['threads'][i]['replies'].push(reply);
            message_board['threads'][i]['bumped_on'] = date;
            break;
          }
        }
        // Save the updated threads of the board
        await Board.updateOne({name: board}, {
          $set: {
            threads: message_board['threads']
          }
        });

        return res.redirect(301, `/b/${board}/${thread_id}`);

      } catch (err) {
        console.log(err);
      }


    })  // .post(async function (req, res)

    .get(async function (req, res){

      const board = req.params.board;
      const thread_id = req.query.thread_id;
      let message_board;
      let res_thread;

      try {
        message_board = await Board.findOne({name: board});

        for (let i = 0; i < message_board['threads'].length; i++) {
          if (message_board['threads'][i]['_id'] == thread_id) {

            // Remove reported and delete_password entries from the thread
            const {
              _id,
              text,
              created_on,
              bumped_on,
              reported,
              delete_password,
              replies
            } = message_board['threads'][i];
    
            res_thread = {
              _id,
              text,
              created_on,
              bumped_on,
              replies
            };
            break;
          }
        }

        // Delete reported and delete_password entries from each reply as well
        res_thread['replies'] = res_thread['replies'].map(reply => {
          const {
            text,
            created_on,
            bumped_on,
            reported,
            delete_password,
            _id
          } = reply;

          return {
            text,
            created_on,
            bumped_on,
            _id
          };
        });

        return res.json(res_thread);

      } catch (err) {
        console.log(err);
      }


    })  // .get(async function (req, res)

    .delete(async function (req, res){

      const board = req.params.board;
      const thread_id = req.body.thread_id;
      const reply_id = req.body.reply_id;
      const delete_password = req.body.delete_password;
      let message_board;
      let index_thread;
      let index_reply;
      let is_correct_pwd = false;

      try {
        // Find the existing board in the database
        message_board = await Board.findOne({name: board});
        
        // Find the reply by id and check if the delete_password is correct
        for (let i = 0; i < message_board['threads'].length; i++) {
          if (message_board['threads'][i]._id == thread_id) {
            for (let j = 0; j < message_board['threads'][i]['replies'].length; j++) {
              if (message_board['threads'][i]['replies'][j]['_id'] == reply_id) {
                if (message_board['threads'][i]['replies'][j]['delete_password'] == delete_password) {
                  index_thread = i;
                  index_reply = j;
                  is_correct_pwd = true;
                }
                break;
              }
            }            
          }
        }

        if (is_correct_pwd) {
          message_board['threads'][index_thread]['replies'][index_reply]['text'] = '[deleted]';

          // Update the message board in the database
          await Board.updateOne({name: board}, {
            $set: {
              threads: message_board['threads']
            }
          });

          return res.send('success');

        } else {
          return res.send('incorrect password');
        }

      } catch (err) {
        console.log(err);
      }

    })  // .delete(async function (req, res)

    .put(async function (req, res){

      const board = req.params.board;
      const thread_id = req.body.thread_id;
      const reply_id = req.body.reply_id;
      let message_board;
      let is_reported = false;

      try {
        // Find the requested board in the database
        message_board = await Board.findOne({name: board});

        // Find the reply by id and update reported to true
        for (let i = 0; i < message_board['threads'].length; i++) {
          if (message_board['threads'][i]['_id'] == thread_id) {
            for (let j = 0; j < message_board['threads'][i]['replies'].length; j++) {
              if (message_board['threads'][i]['replies'][j]['_id'] == reply_id) {
                message_board['threads'][i]['replies'][j]['reported'] = true;
                is_reported = true;
                break;
              }
            }
          }
        }

        if (is_reported) {
          // Update the message board in the database
          await Board.updateOne({name: board}, {
            $set: {
              threads: message_board['threads']
            }
          });

          return res.send('reported');

        }

      } catch (err) {
        console.log(err);
      }

    })  // .put(async function (req, res)

};
