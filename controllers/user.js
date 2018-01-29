    /**
 * Created on 8/16/2017.
 */
'use strict';

const _= require('lodash');
const passport = require('../services/passport');
const facebook = 'facebook';

var moment = require('moment');
var async = require('async');
var UserCollection = require('../models/UserCollection');
var MavenCollection = require('../models/MavenCollection');
var MavenReviewCollection = require('../models/MavenReviewCollection');
var ConsumerReviewCollection = require('../models/ConsumerReviewCollection');
var S = require('../services/status');
var Config = require('../components/configs');
var twilioClient = require('../components/twilioClient');
var Utils = require('../components/utils');
var OneSignal = require('../components/onesignal');
let jwt = require('jsonwebtoken');

exports.register = function (req, res, next) {
    console.log('--register--');
    var values = req.body;
    console.log(values);
    if (!values.password) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'password is required'});
        return;
    }
    if (!values.firstName) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'firstName is required'});
        return;
    }
    if (!values.lastName) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'lastName is required'});
        return;
    }
    if (!values.email) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'email is required'});
        return;
    }
    if (!values.dob) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'dob is required'});
        return;
    }
    if (!values.gender) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'gender is required'});
        return;
    }
    if (!values.phoneNumber) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber is required'});
        return;
    }

    async.waterfall([
        function(next) { //check email duplication
            UserCollection.findOne({
                'email': values.email
            }, function (err, user) {
                if (user) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'email already exists'});
                } else {
                    next(err);
                }
            });
        },
        function(next) { // check phoneNumber duplication
            UserCollection.findOne({
                'phoneNumber': values.phoneNumber
            }, function (err, user) {
                if (user) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber already exists'});
                } else {
                    next(err);
                }
            });
        },
        function(next) {
            var newUser = new UserCollection();
            newUser.email = values.email;
            newUser.password = values.password;
            newUser.firstName = values.firstName;
            newUser.lastName = values.lastName;
            newUser.phoneNumber = values.phoneNumber;
            newUser.gender = values.gender;
            newUser.dob = values.dob;
            if(values.displayPicture) {
                newUser.displayPicture = values.displayPicture;
            } else if(req.file){
                newUser.displayPicture = req.file.location;
            }
            newUser.save(function(err) {
                next(err, newUser);
            });
        }
    ], function (err, user) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'verify account with your phone', userID: user._id});
            }
    });
};

exports.updateProfileDetails = function (req, res, next) {
    const values = _.omit(req.query, 'id');
    console.log('---updateProfileDetails-value', values);
    var newUser = req.user;
    if (!newUser) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }
    if (!values.password) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'password is required'});
        return;
    }
    if (!values.firstName) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'firstName is required'});
        return;
    }
    if (!values.lastName) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'lastName is required'});
        return;
    }
    if (!values.email) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'email is required'});
        return;
    }
    if (!values.dob) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'dob is required'});
        return;
    }
    if (!values.gender) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'gender is required'});
        return;
    }
    if (!values.phoneNumber) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber is required'});
        return;
    }
    async.waterfall([
        function(next) { //check email duplication
            UserCollection.findOne({
                'email': values.email
            }, function (err, user) {
                if (user) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'email already exists'});
                } else {
                    next(err);
                }
            });
        },
        function(next) { // check phoneNumber duplication
            UserCollection.findOne({
                'phoneNumber': values.phoneNumber
            }, function (err, user) {
                if (user) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber already exists'});
                } else {
                    next(err);
                }
            });
        },
        function(next) {
            newUser.email = values.email;
            newUser.password = values.password;
            newUser.firstName = values.firstName;
            newUser.lastName = values.lastName;
            newUser.phoneNumber = values.phoneNumber;
            newUser.gender = values.gender;
            newUser.dob = values.dob;
            user.displayPicture = values.displayPicture;
            newUser.save(function(err) {
                next(err);
            });
        }
    ], function (err) {
        if (err) {
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            return;

        } else {
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'update done'});
            return;
        }
    });
};

exports.login = function (req, res, next) {
    console.log('---login--');
    var values = req.body;
    console.log(req.body);
    if (!values.password) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'password is required'});
        return;
    }

    if (!values.email) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'email is required'});
        return;
    }

    async.waterfall([
        function(next) { //check email
            UserCollection.findOne({
                'email': values.email
            }, function (err, user) {
                if (!user) {
                    res.status(S.CLIENTERROR_NOT_FOUND)
                        .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'email or password is invalid'});
                } else {
                    next(err, user);
                }
            });
        },
        function(user, next) { // check password
            user.verifyPassword(values.password, function (err, isMatch) {
                if (!isMatch) {
                    res.status(S.CLIENTERROR_NOT_FOUND)
                        .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'email or password is invalid'});
                } else {
                    next(null, user);
                }
            });
        },
        function(user, next) { // check isVerified
            if (!user.phoneVerified ) {
                console.log('phone number is not verified');
                res.status(S.CLIENTERR_AUTHENTICATION)
                    .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'verify account with your phone', userID: user._id
                    });
            }else if (user.isBanned) {
                console.log('banned user');
                res.status(S.CLIENTERR_AUTHENTICATION)
                    .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'This account is banned.'});
            }else {
                next(null, user);
            }
        },
        function(user, next) {
            user.lastOnlineDate = Date.now();
            user.save(function(err) {
                next(user, err)
            });
        }
    ], function (user, err) {
        if (err) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
            // passport.authenticate('local', _.partial(passport.onPassportAuth, req, res))(req, res);
            var token = jwt.sign({id: user._id}, Config.Auth.SECRET_KEY, {
                expiresIn: "1 days"
            });
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success', token});
        }
    });
};

exports.generateOtp = function (req, res, next) {
    const values = _.omit(req.query, 'id');
    console.log('--generateOtp', values);
    if (!values.phoneNumber) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber is required'});
        return;
    }
    async.waterfall([
            function(next) { // check phoneNumber duplication
                UserCollection.findOne({
                        'phoneNumber': values.phoneNumber
                    }, function (err, user) {
                        if (!user) {
                            res.status(S.CLIENTERROR_NOT_FOUND)
                                .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'Invalid PhoneNumber! Register account with this phoneNumber'});
                            return;
                        } else {
                            next(err, user);
                        }
                    }
                );
            },
            function (user, next) { //send Otp by mobilePhone
                var verifyCode = Math.floor(Math.random() * 90000) + 10000;
                twilioClient.sendSms(user.phoneNumber, verifyCode);
                user.otp = verifyCode;
                user.otpGenerated = Date.now();
                console.log('--genetatedOtp = ', verifyCode);
                user.save(function (err) {
                    next(err);
                });
            }
        ],
        function (err) {
            if (err) {
                res.status(S.CLIENTERR_BAD_REQUEST)
                    .json({status: S.CLIENTERR_BAD_REQUEST, msg: err});
            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success'});
            }
        }
    );
};

exports.verifyOtp = function (req, res, next) {
    const values = _.omit(req.query, 'id');
    console.log('--verifyOtp', values);
    const otp = Number(values.otp);
    if (!values.phoneNumber) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber is required'});
        return;
    }
    if (!otp) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'otp is required'});
        return;
    }
    async.waterfall([
            function(next) { // check phoneNumber duplication
                UserCollection.findOne({
                        'phoneNumber': values.phoneNumber
                    }, function (err, user) {
                        if (!user) {
                            res.status(S.CLIENTERROR_NOT_FOUND)
                                .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'Invalid PhoneNumber! Register account with this phoneNumber'});
                        } else {
                            next(err, user);
                        }
                    }
                );
            },
            function (user, next) { //check otp
                if (user.otp != otp) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'incorrect otp'});
                } else {
                    var now = moment(new Date());
                    var end = moment(user.otpGenerated);
                    var duration = moment.duration(now.diff(end));
                    var mins = duration.asMinutes();
                    if (mins > 10) {
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'expired otp'});
                    } else {
                        user.phoneVerified = true;
                        user.save(function (err) {
                            var token = jwt.sign({id: user._id}, Config.Auth.SECRET_KEY, {
                                expiresIn: "1 days"
                            });
                            next(err, token);
                        });
                    }
                }
            }
        ],
        function (err, token) {
            if (err) {
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: err});
            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success', token});
            }
        }
    );
};

exports.forgotPassword = function (req, res, next) {
    const values = _.omit(req.query, 'id');
    console.log('--forgotPassword', values);
    if (!values.email) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'email is required'});
        return;
    }
    async.waterfall([
            function(next) { //check email
                UserCollection.findOne({
                    'email': values.email
                }, function (err, user) {
                    if (!user) {
                        res.status(S.CLIENTERROR_NOT_FOUND)
                            .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'email is invalid'});
                    } else {
                        next(err, user);
                    }
                });
            },
            function (user, next) { //check otp
                if (!user.phoneVerified) {
                    res.status(S.CLIENTERR_AUTHENTICATION)
                        .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'Verify account with your phoneNumber'});
                } else {
                    var verifyCode = Math.floor(Math.random() * 90000) + 10000;
                    user.otp = verifyCode;
                    user.otpGenerated = Date.now();
                    require('../components/sendMail').sendMail(user.email, 'Reset Password', 'Reset password with this number:' + verifyCode);
                    user.save(function(err) {
                        next(err);
                    });
                }
            }
        ],
        function (err) {
            if (err) {
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: err});
            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success'});
            }
        }
    );
};

exports.resetPassword = function (req, res, next) {
    const values = _.omit(req.query, 'id');
    console.log('--resetPassword', values);
    const otp = Number(values.otp);
    if (!values.email) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'email is required'});
        return;
    }
    if (!values.newPassword) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'newPassword is required'});
        return;
    }
    if (!otp) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'otp is required'});
        return;
    }
    async.waterfall([
            function(next) { // check email duplication
                UserCollection.findOne({
                        'email': values.email
                    }, function (err, user) {
                        if (!user) {
                            res.status(S.CLIENTERROR_NOT_FOUND)
                                .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'Invalid email'});
                        } else {
                            next(err, user);
                        }
                    }
                );
            },
            function (user, next) { //check otp
                if (user.otp != otp) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'incorrect otp'});
                } else {
                    var now = moment(new Date());
                    var end = moment(user.otpGenerated);
                    var duration = moment.duration(now.diff(end));
                    var mins = duration.asMinutes();
                    if (mins > 10) {
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'expired otp'});
                        return;
                    } else {
                        user.password = values.newPassword;
                        user.save(function (err) {
                            next(err, user);
                        });
                    }
                }
            }
        ],
        function (err, user) {
            if (err) {
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: err});
            } else {
                let token = jwt.sign({id: user._id}, Config.Auth.SECRET_KEY, {
                    expiresIn: "1 days"
                });
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success', token});
            }
        }
    );
};

exports.loginFacebook = function (req, res, next) {
    console.log('--loginFacebook--\n', req.user.profile);
    var email = req.user.email;
    var firstName = req.user.profile.name.givenName;
    var lastName = req.user.profile.name.familyName;
    var gender = req.user.profile.gender;
    var photo = req.user.profile.photos[0].value;
    if (!email) {
        res.status(S.CLIENTERROR_NOT_FOUND)
            .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'Not found. Register your account', gender, firstName, lastName, photo});
        return;
    }
    async.waterfall([
            function (next) { //check email exisit
                UserCollection.findOne({
                    email: email
                }, function(err, user) {
                    if (err) {
                        next(user, err);
                    } else {
                        if (!user) {
                            res.status(S.CLIENTERROR_NOT_FOUND)
                                .json({status: S.CLIENTERROR_NOT_FOUND, msg: 'Not found. Register your account', email, gender, firstName, lastName, photo});
                        } else {
                            next(user, null);
                        }
                    }
                });
            },
        ],
        function (user, err) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                if (!user.phoneVerified) {
                    console.log('phone number is not verified');
                    res.status(S.CLIENTERR_AUTHENTICATION)
                        .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'Verify account with your phoneNumber'});
                } else if (user.isBanned) {
                    console.log('banned user');
                    res.status(S.CLIENTERR_AUTHENTICATION)
                        .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'This account is banned.'});
                } else {
                    var token = jwt.sign({id: user._id}, Config.Auth.SECRET_KEY, {
                        expiresIn: "1 days"
                    });
                    res.status(S.SUCCESS_OK)
                        .json({status: S.SUCCESS_OK, msg: 'success', token});
                }
            }
        }
    );
};

exports.updateProfileImage = function (req, res, next) {
    console.log('--updateProfileImage');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    var file = req.files[0];
    if (!file) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Ivalid photo'});
        return;
    } else {
        user.displayPicture = file.location;
        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: err});
            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'Uploaded profile Image', result: { displayPicture : file.location}});
            }
        });
    }
};

exports.uploadProfileImage = function (req, res, next) {
    console.log('--uploadProfileImage');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }
    var file = req.files[0];
    if (!file) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'upload Fail'});
        return;
    } else {
        var displayPicture = file.location;
        if (!displayPicture) {
            res.status(S.CLIENTERR_BAD_REQUEST)
                .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'upload Fail'});
        } else {
            user.displayPicture = displayPicture;
            user.save(function(err) {
                if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal server Error. Plase try again'});
                } else {
                    res.status(S.SUCCESS_OK)
                        .json({status: S.SUCCESS_OK, msg: 'success', displayPicture});
                }
            });
        }
    }
};

exports.getProfileDetails = function (req, res, next) {
    console.log('--getProfileDetails');
    if (!req.user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    async.waterfall([
        function(next) { //check email duplication
            if(req.query.userID) {
                UserCollection.findById(req.query.userID)
                  .exec((err, user) => {
                    if(!user) {
                        res.status((S.CLIENTERR_BAD_REQUEST))
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'userID is invalid.'})
                    } else{
                        next(err, user);
                    }
                });
            } else {
                next(null, req.user);
            }
        },
        function(user, next) {
            console.log(user);
            var result = {
                userId: user._id,
                displayPicture: user.displayPicture,
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender,
                createdDate: user.createdDate,
                lastOnline: user.lastOnlineDate,
                idVerified: user.idVerified,
                premiumStatus: user.premiumStatus,
                about: user.about,
                consumerRating: user.consumerRating
            };
            MavenCollection.find({
                '_id': {$in: user.mavens}})
                .select('_id mainCategory category title rating active status reason')
                .exec((err, mavens) => {
                    result.mavens = mavens;
                    MavenReviewCollection.find({'userID': user._id})
                        .populate({
                            path: 'reviewUserID',
                            select: '_id firstName lastName displayPicture rating'
                        })
                        .exec((err, reviews) => {
                            result.mavenReviews = reviews;
                            ConsumerReviewCollection.find({'_id': {$in: user.reviews}})
                              .populate({
                                path: 'reviewUserID',
                                select: '_id firstName lastName displayPicture rating'
                              })
                              .exec((err, consumerReviews) => {
                                result.consumerReviews= consumerReviews;
                                next(err, result);
                              });
                        });
                });
        }
    ], function (err, result) {
        if (err) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success', result});
        }
    });
};

// this api is not using now
exports.getPostalCode = function (req, res, next) {
    console.log('--getPostalCode--');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    UserCollection.findById(user._id, (err, result) => {
        if(err) {
            res.status(S.CLIENTERR_BAD_REQUEST)
                .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'user not exist'});
        } else {
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success', result: {postalCode: result.postalCode}});
        }
    })
};

exports.checkID = function (req, res, next) {
    console.log('--checkID--');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }
    var result =  {
        idVerified: user.idVerified
    };
    result.postalCode = user.postalCode;
    res.status(S.SUCCESS_OK)
        .json({status: S.SUCCESS_OK, msg: 'success', result});
};

exports.changePhoneNumber = function (req, res, next) {
    console.log('--changePhoneNumber--');
    console.log(req.query);

    if (!req.query.userID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'userID is required.'});
        return;
    }

    if (!req.query.phoneNumber) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber is required.'});
        return;
    }

    async.waterfall([
        (next) => {
            UserCollection.findOne({
                'phoneNumber': req.query.phoneNumber
            }, function (err, user) {
                if (user) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'phoneNumber already exists'});
                } else {
                    next(err);
                }
            });
        },
        (next) => {
            UserCollection.findById(req.query.userID, (err, user) => {
                if (!user) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'invalid userID.'});
                    return;
                }
                user.phoneNumber = req.query.phoneNumber;
                user.save((err) => {
                    next(err);
                })
            });
        }
    ], (err) => {
        if(err) {
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success'});
        }
    });

};

exports.editAbout = function (req, res, next) {
    console.log('--editAbout--');
    console.log(req.query);
    var user = req.user;

    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    user.about = req.query.about || '';
    user.save((err) => {
        if(err) {
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success'});
        }
    })
};

exports.saveMaven = function (req, res, next) {
    console.log('--saveMaven--');
    console.log(req.query);
    var user = req.user;

    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if (!req.query.mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mavenID is required'});
        return;
    }

    if(user.savedList.indexOf(req.query.mavenID) === -1) {
      user.savedList.push(req.query.mavenID);
    }
    user.save((err) => {
        if(err) {
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success'});
        }
    })
};


exports.getSavedMavens= function (req, res, next) {
    console.log('--getSavedMavens--');
    console.log(req.query);
    var user = req.user;

    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    MavenCollection.find({
        '_id': {$in: user.savedList}})
        .select('_id category title rating price userID')
        .populate({
            path: 'userID',
            select: 'firstName lastName displayPicture'
        })
        .exec((err, mavens) => {
            if(err) {
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success', result: mavens});
            }
        });
};
