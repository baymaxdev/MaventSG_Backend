'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MavenReviewSchema = new Schema({
    actID: {
        type: Schema.ObjectId,
        ref: 'ActivityCollection',
        unique: true,
        dropDups: true
    },
    userID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    mavenID: {
        type: Schema.ObjectId,
        ref: 'MavenCollection',
    },
    reviewUserID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    rating: Number,
    description: String,
    createdDate: {
      type: Date,
      default: Date.now,
    },
}, {collection: 'MavenReviewCollection', versionKey: false});


module.exports = mongoose.model('MavenReviewCollection', MavenReviewSchema);