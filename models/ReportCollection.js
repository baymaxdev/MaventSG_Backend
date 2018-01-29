'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReportSchema = new Schema({

    reporterID: {
        type: Schema.ObjectId,
        ref: 'UserCollection'
    },
    mavenID: {
        type: Schema.ObjectId,
        ref: 'MavenCollection',
    },
    description: String,
    createdDate: {
      type: Date,
      default: Date.now,
    },
}, {collection: 'ReportCollection', versionKey: false});


module.exports = mongoose.model('ReportCollection', ReportSchema);