'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TopicSchema = new Schema({
    userID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    hearts: [{
        type: Schema.ObjectId,
        ref: 'UserCollection',
        default: []
    }],
    category: String,
    comments: [{
        type: Schema.ObjectId,
        ref: 'CommentCollection',
        default: []
    }],
    image: {
        type: String,
        default: null
    },
    text: String,
    createdDate: {
        type: Date,
        default: Date.now,
    },
}, {collection: 'TopicCollection', versionKey: false});


module.exports = mongoose.model('TopicCollection', TopicSchema);