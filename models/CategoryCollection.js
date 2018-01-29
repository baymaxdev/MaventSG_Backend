'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Config = require('../components/configs');

var CategorySchema = new Schema({
    mainCategory: {
        type: Number,
        enum: [Config.MavenMainCategory.skill, Config.MavenMainCategory.service]
    },
    category: String,
    topics: [{
        type: Schema.ObjectId,
        ref: 'TopicCollection',
        default: []
    }]
}, {collection: 'CategoryCollection', versionKey: false});

module.exports = mongoose.model('CategoryCollection', CategorySchema);