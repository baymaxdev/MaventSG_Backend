'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Config = require('../components/configs');

var ActivitySchema = new Schema({
    userID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    mavenID: {
        type: Schema.ObjectId,
        ref: 'MavenCollection',
    },
    mavenUserID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    price: Number,
    status: {
        type: Number,
        default: Config.ActivityStatusType.Messaged
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    endedDate: Date
}, {collection: 'ActivityCollection', versionKey: false});

module.exports = mongoose.model('ActivityCollection', ActivitySchema);