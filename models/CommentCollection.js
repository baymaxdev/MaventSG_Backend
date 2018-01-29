'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
    userID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    topicID: {
        type: Schema.ObjectId,
        ref: 'TopicCollection'
    },
    hearts: [{
        type: Schema.ObjectId,
        ref: 'UserCollection',
        default: []
    }],
    createdDate: {
        type: Date,
        default: Date.now,
    },
    text: String
}, {collection: 'CommentCollection', versionKey: false});


module.exports = mongoose.model('CommentCollection', CommentSchema);