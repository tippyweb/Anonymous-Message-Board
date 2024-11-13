const mongoose = require('mongoose');

// setting up Schema and DB models
const Schema = mongoose.Schema;

// Reply schema
const ReplySchema = new Schema({
  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: new Date()
  },
  bumped_on: {
    type: Date,
    default: new Date()
  },
  reported: {
    type: Boolean,
    default: false
  },
  delete_password: {
    type: String,
    required: true
  }
});

// Thread schema
const ThreadSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: new Date()
  },
  bumped_on: {
    type: Date,
    default: new Date()
  },
  reported: {
    type: Boolean,
    default: false
  },
  delete_password: {
    type: String,
    required: true
  },
  replies: [{
    type: ReplySchema
  }]
});

// Board schema
const BoardSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  threads: [{
    type: ThreadSchema
  }]
});

const Board  = mongoose.model("Board", BoardSchema);
const Thread = mongoose.model("Thread", ThreadSchema);
const Reply  = mongoose.model("Reply", ReplySchema);

exports.Board  = Board;
exports.Thread = Thread;
exports.Reply  = Reply;