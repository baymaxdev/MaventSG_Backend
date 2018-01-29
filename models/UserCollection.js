'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var Config = require('../components/configs');
/* User schema */

var UserSchema = new Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    gender: {
        type: Number,
        default: Config.Gender.Undefined,
        enum: [Config.Gender.Male, Config.Gender.Female, Config.Gender.Undefined]
    },
    dob: String,
    displayPicture: {
        type:String,
        default: null
    },
    phoneNumber: String,
    phoneVerified: {
        type: Boolean,
        default: false,
    },
    accountType: {
        type: Number,
        default: Config.AccountType.consumer,
        enum: [Config.AccountType.consumer, Config.AccountType.maven]
    },
    idVerified: {
        type: Boolean,
        default: false,
    },
    idPictures: { // 2 images front and back
        type: [String],
        default: []
    },
    mavens: [{
        type: Schema.ObjectId,
        ref: 'MavenCollection',
        default: []
    }],
    about: {
        type: String,
        default: null
    },
    postalCode: {
        type: String,
        default: null
    },
    location: {
        type: [Number],
        index: '2d',
        default: null
    },
    premiumStatus: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    lastOnlineDate: Date,
    savedList: [{
        type: Schema.ObjectId,
        ref: 'MavenCollection',
        default: []
    }],
    // mavenRating: Number,
    consumerRating: {
        type: Number,
        default: 0
    },
    reviews: [{ // for consumer
        type: Schema.ObjectId,
        ref: 'ConsumerReviewCollection',
        default: []
    }],
    isBanned: {
        type: Boolean,
        default: false
    },
    otp: Number,
    otpGenerated: {
        type: Date,
        default: Date.now
    }
}, {collection: 'UserCollection', versionKey: false});

UserSchema.pre('save', function (callback) {
    var user = this;
    if (!user.isNew && !user.isModified('password')) return callback();
    bcrypt.genSalt(5, function (err, salt) {
        if (err) return callback(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return callback(err);
            user.password = hash;
            callback();
        });
    });
});


UserSchema.pre('update', function (callback) {
    var user = this;
    if (!user.isModified('password')) return callback();
    console.log('password changed to ', user.password);
    bcrypt.genSalt(5, function (err, salt) {
        if (err) return callback(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return callback(err);
            user.password = hash;
            callback();
        });
    });
});

UserSchema.methods.verifyPassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('UserCollection', UserSchema);