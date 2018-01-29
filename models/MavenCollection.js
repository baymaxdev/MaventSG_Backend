'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Config = require('../components/configs');


var MavenSchema = new Schema({
    userID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    mainCategory: {
        type: Number,
        default: Config.MavenMainCategory.skill,
        enum: [Config.MavenMainCategory.skill, Config.MavenMainCategory.service]
    },
    category: String,
    title: String,
    description: String,
    pictures: {
        type: [String],
        default: []
    },
    // idPictures: [String],
    dayAvailable: String,
    timeAvailable: String,
    price: Number,
    status: {
        type: Number,
        default: Config.MavenStatusType.Pending
    },
    // postalCode: String,
    location: {
        type: [Number],
        index: '2d',
        default: null
    },
    reason: String,
    pageViewed: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        type: Schema.ObjectId,
        ref: 'MavenReviewCollection',
        default: []
    }],
    active: {
        type: Boolean,
        default: false
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
}, {collection: 'MavenCollection', versionKey: false});

module.exports = mongoose.model('MavenCollection', MavenSchema);