/**
 * Created on 8/16/2017.
 */
'use strict';

var async = require('async');
var UserCollection = require('../models/UserCollection');
var MavenCollection = require('../models/MavenCollection');
var MavenReviewCollection = require('../models/MavenReviewCollection');
var ReportCollection = require('../models/ReportCollection');
var S = require('../services/status');
var Config = require('../components/configs');
var twilioClient = require('../components/twilioClient');
var Utils = require('../components/utils');
var OneSignal = require('../components/onesignal');
const geolib = require('geolib');
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder({
    provider: 'google',
    httpAdapter: 'https',
    apiKey: Config.GOOGLE_API_KEY,
});

exports.registerMaven = function (req, res, next) {
    console.log('--addMaven--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    let values = req.body;
    console.log(req.body);
    if (!values.mainCategory) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mainCategory is required'});
        return;
    }
    if (!values.category) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'category is required'});
        return;
    }
    if (!values.title) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'title is required'});
        return;
    }
    if (!values.description) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'description is required'});
        return;
    }
    if (!user.idVerified && !values.postalCode) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'postalCode is required'});
        return;
    }
    if (!values.dayAvailable) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'dayAvailable is required'});
        return;
    }
    if (!values.timeAvailable) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'timeAvailable is required'});
        return;
    }
    if (!values.price) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'price is required'});
        return;
    }

    async.waterfall([
            function(next) { //check category duplication
                MavenCollection.findOne({
                    'category': values.category,
                    'userID': user._id
                }, (err, maven) => {
                    if (maven) {
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'maven already exists'});
                    } else {
                        next(err);
                    }
                });
            },
            function (next) { // check postalCode is valid
                if (user.postalCode) {
                    next(null);
                    return;
                }
                geocoder.geocode(values.postalCode, function(err, result) {
                    if(err) {
                        next(err);
                    } else {
                        if(!result.length) {
                            res.status(S.CLIENTERR_BAD_REQUEST)
                                .json({status: S.CLIENTERR_BAD_REQUEST, msg:'Postal code is not valid.'});
                            return;
                        }
                        user.postalCode = values.postalCode;
                        user.location = [result[0].latitude, result[0].longitude];
                        next(null);
                    }
                });
            },
            function (next) {
                let isPremiumStatus = user.premiumStatus;
                if (!isPremiumStatus && user.mavens.length >= 3) { // check user can add maven
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Failed. You already registered 3 mavens. To add more maven, upgrade your account.'});
                    return;
                }
                let newMaven = new MavenCollection();
                newMaven.active = true;

                if (!isPremiumStatus && user.mavens.length) {
                    newMaven.active = false;
                }

                newMaven.userID = user._id;
                newMaven.mainCategory = values.mainCategory;
                newMaven.category = values.category;
                newMaven.title = values.title;
                newMaven.description = values.description;
                newMaven.dayAvailable = values.dayAvailable;
                newMaven.timeAvailable = values.timeAvailable;
                newMaven.price = values.price;
                newMaven.location = user.location;
                if (user.idVerified) {
                    newMaven.status = Config.MavenStatusType.Approved;
                }
                // if(req.files['idPictures'] && !user.idPictures.length) {
                //     user.idPictures = Array.from(req.files['idPictures'], (picture) => {
                //         return picture.location;
                //     });
                // }
                if(req.files['idPicture1'] && req.files['idPicture2']) {
                    user.idPictures.push(req.files['idPicture1'][0].location);
                    user.idPictures.push(req.files['idPicture2'][0].location);
                    if(req.files['idPicture3'])
                      user.idPictures.push(req.files['idPicture3'][0].location);
                }

                if(req.files['picture1']) {
                    newMaven.pictures.push(req.files['picture1'][0].location);
                }
                if(req.files['picture2']) {
                    newMaven.pictures.push(req.files['picture2'][0].location);
                }
                if(req.files['picture3']) {
                    newMaven.pictures.push(req.files['picture3'][0].location);
                }
                newMaven.save((err) => {
                    next(err, newMaven);
                })
            },
            function(newMaven, next) {
                console.log('new maven added');
                user.mavens.push(newMaven._id);
                user.accountType = Config.AccountType.maven;
                user.save(function(err) {
                    next(err);
                });
            }
        ],
        function(err) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});

            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success: please wait for approval within 3 days'});
            }
        }
    );
};

exports.editMaven = function (req, res, next) {
    console.log('--editMaven--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }
    var values = req.body;
    console.log(req.values);
    if (!values.mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mavenID is required'});
        return;
    }

    async.waterfall([
            function(next) {
                MavenCollection.findOne({
                    _id: values.mavenID,
                    userID: user._id
                }).exec( function(err, maven) {
                        if(!maven) {
                            res.status(S.CLIENTERR_BAD_REQUEST)
                                .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
                            return;
                        }
                        next(err, maven);
                    });
            },
            function(maven, next) {
                maven.title = values.title || maven.title;
                maven.description = values.description || maven.description;
                maven.price = values.price || maven.price;
                maven.dayAvailable = values.dayAvailable || maven.dayAvailable;
                maven.timeAvailable = values.timeAvailable || maven.timeAvailable;
                maven.save((err) => {
                    next(err);
                });
            }
        ],
        function(err) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});

            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success'});
            }
        }
    );
};

exports.getMavenDetails = function (req, res, next) {
    console.log('--getMavenDetails');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    const mavenID = req.query.mavenID;
    if (!mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mavenID is required'});
        return;
    }

    MavenCollection.findById(mavenID)
        .populate({
            path: 'userID',
            select: 'displayPicture firstName lastName lastOnlineDate idVerified'
        })
        .populate({
            path: 'reviews',
            populate: {
                path: 'reviewUserID',
                select: '_id lastName firstName displayPicture'
            }
        })
        .exec(function(err, maven) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again.'});
            } else {
                if(!maven) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Internal Server Error, Try again.'});
                }
                var location = null;
                if(req.query.latitude && req.query.longitude) {
                    location = [req.query.latitude, req.query.longitude];
                } else {
                    location = user.location;
                }
                var distance = 'N/A';
                if(location) {
                    try {
                        distance =  geolib.getDistance(
                            { latitude: location[0], longitude: location[1]},
                            { latitude: maven.location[0], longitude: maven.location[1]}
                        );
                    } catch(e) {
                        console.log(e);
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Latitude and longitude are invalid.'});
                    }
                }
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success', result: {maven, distance}});
            }
        });
};

exports.changeActive = function (req, res, next) {
    console.log('--changeActive--');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    let mavenID = req.query.mavenID;
    console.log(mavenID);
    if (!mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mavenID is required'});
        return;
    }
    // if (user.premiumStatus) {
    //     res.status(S.SUCCESS_OK)
    //         .json({status: S.SUCCESS_OK, msg: 'success'});
    //     return;
    // }
    if (user.mavens.indexOf(mavenID) === -1) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
        return;
    }
    async.waterfall([
            function(next) {
                MavenCollection.find({'userID': user._id}, function(err, mavens) {
                    console.log(mavens);
                    if (!mavens) {
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
                    }else {
                        mavens.forEach((maven) => {
                            if (maven._id == mavenID) {
                                maven.active = true;
                            }
                            else {
                                if(!user.premiumStatus)
                                    maven.active = false;
                            }
                            maven.save((err) => {
                                next(err);
                            })
                        });
                    }
                });
            }
        ],
        function(err) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});

            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success'});
            }
        }
    );
};

exports.deactivate = function (req, res, next) {
    console.log('--deativate--');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    let mavenID = req.query.mavenID;
    console.log(mavenID);
    if (!mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mavenID is required'});
        return;
    }

    async.waterfall([
        function(next) {
                MavenCollection.findById(mavenID, function(err, maven) {
                    if (!maven) {
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
                    }else {
                        maven.active = false;
                        maven.save((err) => {
                            next(err);
                        });
                    }
                });
            }
        ],
        function(err) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});

            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success'});
            }
        }
    );
};

exports.deleteMaven = function (req, res, next) {
    console.log('--deleteMaven--');
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    let mavenID = req.query.mavenID;
    console.log(mavenID);
    if (!mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mavenID is required'});
        return;
    }

    var index = user.mavens.indexOf(mavenID);
    if (index === -1) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
        return;
    }

    async.waterfall([
        function(next) {
            user.mavens.splice(index,1);
            user.save((err) => {
                next(err);
            });
        },
        function(next) {
                MavenCollection.findById(mavenID, function(err, maven) {
                    if (!maven) {
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
                    }else {
                        maven.remove((err) => {
                            next(err);
                        });
                    }
                });
            }
        ],
        function(err) {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});

            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success'});
            }
        }
    );
};

exports.addMavenImage = function (req, res, next) {
    console.log('--addMavenImage');
    console.log(req.body.mavenID);
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }
    if (!req.body.mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'mavenID is required'});
        return;
    }
    if (user.mavens.indexOf(req.body.mavenID) === -1) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
        return;
    }

    var file = req.files[0];
    if (!file) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'upload Fail'});
    } else {
        if (!file.location) {
            res.status(S.CLIENTERR_BAD_REQUEST)
                .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'upload Fail'});
        } else {
            MavenCollection.findById(req.body.mavenID, function(err, maven) {
                if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again.'});
                } else {
                    if (maven.pictures.length >= 3) {
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'upload failed. Maven can have a maximum of 3 images.'});
                    } else {
                        maven.pictures.push(file.location);
                        maven.save((err) =>{
                            if (err) {
                                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again.'});
                            } else {
                                res.status(S.SUCCESS_OK)
                                    .json({status: S.SUCCESS_OK, msg: 'success', result: {
                                        imageUrl: file.location
                                    }});
                            }
                        });
                    }
                }
            });
        }
    }
};

exports.deleteMavenImage = function (req, res, next) {
    console.log('--deleteMavenImage--');
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
    if (!req.query.index) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'index is required'});
        return;
    }
    if (user.mavens.indexOf(req.query.mavenID) === -1) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Maven not exist.'});
        return;
    }
    MavenCollection.findById(req.query.mavenID, function(err, maven) {
        if (err) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again.'});

        } else {
            if (!maven.pictures[req.query.index]) {
                res.status(S.CLIENTERR_BAD_REQUEST)
                    .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Index is invalid.'});
                return;
            }
            maven.pictures.splice(req.query.index, 1);
            maven.save((err) =>{
                if (err) {
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                } else {
                    res.status(S.SUCCESS_OK)
                        .json({status: S.SUCCESS_OK, msg: 'success'});
                }
            });
        }
    });
};

exports.getNearbyList = function (req, res, next) {
    console.log('--getNearbyList');
    console.log(req.query);
    var user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(!req.query.latitude || !req.query.longitude || !req.query.user_longitude || !req.query.user_longitude) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Location info is not correct.'});
        return;
    }

    var location = [ req.query.latitude, req.query.longitude ];
    var user_location = [ req.query.user_latitude, req.query.user_longitude ];
    var query = {
        active: true,
        userID: {$ne: user._id},
        location: {
            $near: location
        },
    };

    MavenCollection.find(query)
        .limit(100)
        .select('_id category title rating price location userID')
        .populate({
            path: 'userID',
            select: 'lastName firstName displayPicture idVerified',
        })
        .exec((err, mavens) =>{
            let verfiedMavens = [];
            let unVerifiedMavens = [];
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                mavens.forEach((maven) => {
                    var obj = {
                            mavenID: maven._id,
                            category: maven.category,
                            displayPicture: maven.userID.displayPicture,
                            lastName: maven.userID.lastName,
                            firstName: maven.userID.firstName,
                            title: maven.title,
                            rating: maven.rating,
                            price: maven.price,
                            idVerified: maven.userID.idVerified,
                            distance: geolib.getDistance(
                                {latitude: user_location[0], longitude: user_location[1]},
                                {latitude: maven.location[0], longitude: maven.location[1]})
                        };
                    if (obj.idVerified)
                        verfiedMavens.push(obj);
                    else
                        unVerifiedMavens.push(obj);
                });
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success', result: verfiedMavens.concat(unVerifiedMavens)});
            }
        });
};

exports.getCatListing = function (req, res, next) {
    console.log('--getCatListing--');
    console.log(req.query);
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(!req.query.category || !req.query.filter || !req.query.latitude || !req.query.longitude) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    let location = [ req.query.latitude, req.query.longitude];

    let query = {
        active: true,
        category: req.query.category,
        userID: {$ne: user._id},
        location: {
            $near: location
        },
    };
    if(req.query.rating)
        query.rating = {$gte: req.query.rating}

    if(req.query.availableToday && req.query.availableToday == 1) {
        let d = new Date();
        let today = d.getDay();
        if (today === 0)
            today = 6;
        else
            today -= 1;
        query.dayAvailable= {
            $regex: `${today}`
        }
    }

    var sort = {};
    if(req.query.filter && req.query.filter == 1) {
        sort = {price: 1};
    }

    let page = req.query.page || 1;
    let perPage = 10;
    MavenCollection.find(query, null, {sort: sort})
        .limit(perPage)
        .skip(perPage * (page -1))
        .select('_id category title rating price location userID')
        .populate({
            path: 'userID',
            select: 'lastName firstName displayPicture idVerified',
        })
        .exec((err, mavens) =>{
            let verfiedMavens = [];
            let unVerifiedMavens = [];
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                mavens.forEach((maven) => {
                    var obj = {
                        mavenID: maven._id,
                        category: maven.category,
                        displayPicture: maven.userID.displayPicture,
                        lastName: maven.userID.lastName,
                        firstName: maven.userID.firstName,
                        title: maven.title,
                        rating: maven.rating,
                        price: maven.price,
                        idVerified: maven.userID.idVerified,
                        distance: geolib.getDistance(
                            { latitude: req.query.latitude, longitude: req.query.longitude },
                            { latitude: maven.location[0], longitude: maven.location[1]})};
                    if (obj.idVerified)
                        verfiedMavens.push(obj);
                    else
                        unVerifiedMavens.push(obj);
                });
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success', result: verfiedMavens.concat(unVerifiedMavens)});
            }
        });
};

exports.reportMaven = (req, res, next) => {
    console.log('--reportMaven--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if (!req.body.mavenID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'MavenID is required.'});
        return;
    }

    async.waterfall([
        (next) => {
            // check MavenID is correct
            MavenCollection.findById(req.body.mavenID, (err, maven) => {
                if (!maven) {
                    res.status(S.CLIENTERR_BAD_REQUEST)
                        .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Invalid mavenID.'});
                } else {
                    next(err);
                }
            })
        },
        (next) => {
            // add report
            let report = new ReportCollection();
            report.mavenID = req.body.mavenID;
            report.reporterID = user._id;
            report.description = req.body.description;
            report.save((err) => next(err));
        }
    ], (err) => {
        if (err) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});

        } else {
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success'});
        }
    })
};