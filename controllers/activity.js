var ActivityCollection = require('../models/ActivityCollection');
var UserCollection = require('../models/UserCollection');
var MavenCollection = require('../models/MavenCollection');
var ConsumerReviewCollection = require('../models/ConsumerReviewCollection');
var MavenReviewCollection = require('../models/MavenReviewCollection');
var S = require('../services/status');
var Config = require('../components/configs');
var async = require('async');

exports.initChat = (req, res, next) => {
  console.log('--initChat--');
  console.log(req.query);
  let user = req.user;
  if (!user) {
    res.status(S.CLIENTERR_AUTHENTICATION)
      .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
    return;
  }

  if(!req.query.mavenID) {
    res.status(S.CLIENTERR_BAD_REQUEST)
      .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
    return;
  }
  async.waterfall([
      (next) => {
        ActivityCollection.findOne({
          userID: user._id,
          mavenID: req.query.mavenID,
          status: {$in: [Config.ActivityStatusType.Offered, Config.ActivityStatusType.Accepted]}
        }, (err, activity) =>{
          if(activity)
            res.status(S.CLIENTERR_BAD_REQUEST)
              .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'already created.'});
          else
            next(err);
        });
      },
      (next) => {
        MavenCollection.findById(req.query.mavenID)
          .select('userID active')
          .exec((err, maven) => {
            if (!maven || !maven.active)
              res.status(S.CLIENTERR_BAD_REQUEST)
                .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'not active maven.'});
            else
              next(err, maven);
          })
      },
      (maven, next) => {
        let newActivity = new ActivityCollection();
        newActivity.userID = user._id;
        newActivity.mavenID = req.query.mavenID;
        newActivity.mavenUserID = maven.userID;
        newActivity.price = -1;

        newActivity.save((err) => {
          next(err, newActivity);
        });
      }
    ],
    (err, acitivity) => {
      if (err) {
        console.log(err);
        res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
          .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
      } else {
        res.status(S.SUCCESS_OK)
          .json({status: S.SUCCESS_OK, msg: 'success', activityID: acitivity._id});
      }
    });
};

exports.createOffer = (req, res, next) => {
    console.log('--createOffer--');
    console.log(req.query);
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(!req.query.activityID || !req.query.price) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }
    async.waterfall([
            (next) => {
                ActivityCollection.findById(req.query.activityID, (err, activity) =>{
                        next(err, activity);
                });
            },
            (activity,next) => {
              activity.price = req.query.price;
              activity.status = Config.ActivityStatusType.Offered;
              activity.save((err) => {
                next(err);
              });
            },
        ],
        (err) => {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success'});
            }
        });
};

exports.acceptOffer = (req, res, next) => {
    console.log('--acceptOffer--');
    console.log(req.query);
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(!req.query.actID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    ActivityCollection.findOne({
        _id: req.query.actID,
        mavenUserID: user._id,
        status: Config.ActivityStatusType.Offered
    }, (err, activity) => {
        console.log(err, activity);
        if(err || !activity) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Invalid actID'});
        } else {
            activity.status = Config.ActivityStatusType.Accepted;
            activity.save((err) => {
                if (err) {
                    console.log(err);
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

exports.rejectOffer = (req, res, next) => {
    console.log('--rejectOffer--');
    console.log(req.query);
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(!req.query.actID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    ActivityCollection.findOne({
        _id: req.query.actID,
        mavenUserID: user._id,
        status: Config.ActivityStatusType.Offered
    }, (err, activity) => {
        console.log(err, activity);
        if(err || !activity) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Invalid actID'});
        } else {
            activity.status = Config.ActivityStatusType.Rejected;
            activity.save((err) => {
                if (err) {
                    console.log(err);
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

exports.cancelOffer = (req, res, next) => {
    console.log('--cancelOffer--');
    console.log(req.query);
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(!req.query.type || !req.query.actID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    var callback = (err, activity) => {
        if (err || !activity) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Invalid actID'});
        } else {
            activity.status = Config.ActivityStatusType.Cancelled;
            activity.save((err) => {
                if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                } else {
                    res.status(S.SUCCESS_OK)
                        .json({status: S.SUCCESS_OK, msg: 'success'});
                }
            });
        }
    };
    if(req.query.type == 0) { // consumer cancel
        ActivityCollection.findOne({
            _id: req.query.actID,
            userID: user._id,
            status: {$in : [Config.ActivityStatusType.Offered, Config.ActivityStatusType.Accepted]}
        }, callback);
    } else {
        ActivityCollection.findOne({ //maven cancel
            _id: req.query.actID,
            mavenUserID: user._id,
            status: Config.ActivityStatusType.Accepted,
        }, callback);
    }
};

exports.editOffer = (req, res, next) => {
    console.log('--editOffer--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(!req.query.actID || !req.query.price) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    ActivityCollection.findOne({
        _id: req.query.actID,
        userID: user._id
    }, (err, activity) => {
        if(err || !activity) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Invalid actID'});
        } else {
            activity.price = req.query.price;
            activity.status = Config.ActivityStatusType.Offered;
            activity.save((err) => {
                if (err) {
                    console.log(err);
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

exports.end = (req, res, next) => {
    console.log('--end--');
    console.log(req.query);
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }
    if(!req.query.actID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    ActivityCollection.findById(req.query.actID, (err, activity) => {
        if(err || !activity) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Invalid actID'});
        } else {
            activity.status = Config.ActivityStatusType.Completed;
            activity.endedDate = Date.now();
            activity.save((err) => {
                if (err) {
                    console.log(err);
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

exports.review = (req, res, next) => {
  console.log('--review--');
  console.log(req.query);
  let user = req.user;
  if (!user) {
    res.status(S.CLIENTERR_AUTHENTICATION)
      .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
    return;
  }
  if(!req.query.type|| !req.query.actID || !req.query.rating) {
    res.status(S.CLIENTERR_BAD_REQUEST)
      .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
    return;
  }

  ActivityCollection.findById(req.query.actID, (err, activity) => {
    if(err || !activity) {
      console.log(err);
      res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Invalid actID'});
    } else {
      if(activity.status === Config.ActivityStatusType.ConsumerReviewed || activity.status === Config.ActivityStatusType.MavenReviewed) {
        activity.status = Config.ActivityStatusType.BothReviewed;
      }else if(req.query.type == 0) {
        activity.status = Config.ActivityStatusType.ConsumerReviewed;
      }else {
        activity.status = Config.ActivityStatusType.MavenReviewed;
      }

      activity.save((err) => {
        if (err) {
          console.log(err);
          res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
            .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
          var review = null;
          if(req.query.type == 0) {//requested user is consumer
            review = new MavenReviewCollection();
            review.userID = activity.mavenUserID;
          }
          else { // user is maven
            review = new ConsumerReviewCollection();
            review.userID = activity.userID;
          }
          review.actID  = activity._id;
          review.mavenID = activity.mavenID;
          review.reviewUserID = user._id;
          review.rating = req.query.rating;
          review.description = req.query.description || "";
          review.save((err) => {
            if (err) {
              console.log(err);
              res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
              if (req.query.type == 0) {
                MavenCollection.findById(review.mavenID, (err, maven) => {
                  if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                      .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                  } else {
                    var jobCount = maven.reviews.length;
                    maven.reviews.push(review._id);
                    maven.rating = (maven.rating * jobCount + review.rating) / (jobCount + 1);
                    maven.save((err) => {
                      if (err) {
                        console.log(err);
                        res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                          .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                      } else {
                        res.status(S.SUCCESS_OK)
                          .json({status: S.SUCCESS_OK, msg: 'success'});
                      }
                    });
                  }
                });
              } else {
                UserCollection.findById(activity.userID, (err, consumer) => {
                  if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                      .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                  } else {
                    var jobCount = consumer.reviews.length;
                    consumer.reviews.push(review._id);
                    consumer.consumerRating = (consumer.consumerRating* jobCount + review.rating) / (jobCount + 1);
                    consumer.save((err) => {
                      if (err) {
                        console.log(err);
                        res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                          .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                      } else {
                        res.status(S.SUCCESS_OK)
                          .json({status: S.SUCCESS_OK, msg: 'success'});
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
  });
};

exports.getActivities = (req, res, next) => {
    console.log('--getActivities--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if(req.query.mode == undefined || req.query.mode == "" ) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    if (req.query.mode == 0) {
        ActivityCollection.find({mavenUserID: user._id})
            .populate({
                path: 'mavenID',
                select: 'category title'
            })
            .populate({
                path: 'userID',
                select: 'displayPicture lastName firstName'
            })
            .exec((err, activies) => {
                if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                } else {
                    if (activies)
                        res.status(S.SUCCESS_OK)
                            .json({status: S.SUCCESS_OK, msg: 'success', result: activies});
                    else
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'no activities'});
                }
            });
    } else {
        ActivityCollection.find({userID: user._id})
            .populate({
                path: 'mavenID',
                select: 'category title'
            })
            .populate({
                path: 'mavenUserID',
                select: 'displayPicture lastName firstName'
            })
            .exec((err, activies) => {
                if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                } else {
                    if (activies)
                        res.status(S.SUCCESS_OK)
                            .json({status: S.SUCCESS_OK, msg: 'success', result: activies});
                    else
                        res.status(S.CLIENTERR_BAD_REQUEST)
                            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'no activities'});
                }
            })
    }
};

exports.archive = (req, res, next) => {
  console.log('--archive--');
  console.log(req.query);
  let user = req.user;
  if (!user) {
    res.status(S.CLIENTERR_AUTHENTICATION)
      .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
    return;
  }

  if(!req.query.actID) {
    res.status(S.CLIENTERR_BAD_REQUEST)
      .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
    return;
  }

  ActivityCollection.findById(req.query.actID, (err, activity) => {
    if(err || !activity) {
      console.log(err);
      res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Invalid actID'});
    } else {
      if(activity.status != Config.ActivityStatusType.BothReviewed) {
        res.status(S.CLIENTERR_BAD_REQUEST)
          .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'This activity is not reviewed yet.'});
        return;
      }
      if (!user._id.equals(activity.userID) && !user._id.equals(activity.mavenUserID)) {
        res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
          .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Permission denied.'});
        return;
      }
      activity.status = Config.ActivityStatusType.Archived;
      activity.save((err) => {
        if (err) {
          console.log(err);
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