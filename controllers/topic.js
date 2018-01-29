var TopicCollection = require('../models/TopicCollection');
var CommentCollection = require('../models/CommentCollection');
var CategoryCollection = require('../models/CategoryCollection');
var S = require('../services/status');

exports.createTopic = (req, res, next) => {
    console.log('--createTopic--');
    console.log(req.body);
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    let values = req.body;
    if (!values.category) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Category is required.'});
        return;
    }
    if (!values.text) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Text is required.'});
        return;
    }

    let newTopic = new TopicCollection();
    newTopic.userID = user._id;
    newTopic.category = values.category;
    newTopic.text = values.text;
    if (req.file)
        newTopic.image = req.file.location;
    newTopic.save((err) => {
        if (err) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
            CategoryCollection.findOne({
                category: values.category
            }, (err, category) => {
                if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                } else {
                    console.log(category);
                    category.topics.push(newTopic._id);
                    category.save();
                    res.status(S.SUCCESS_OK)
                        .json({status: S.SUCCESS_OK, msg: 'success', result: {topicID: newTopic._id}});
                }
            });
        }
    });
};

exports.addComment = (req, res, next) => {
    console.log('--addComment--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }
    let values = req.body;
    console.log(values);
    if (!values.topicID || !values.text) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    TopicCollection.findById(req.body.topicID)
        .exec((err, topic) => {
            if (!topic) {
                res.status(S.CLIENTERR_BAD_REQUEST)
                    .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'TopicID is invalid.'});
                return;
            }
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                return;
            }
            let newComment = new CommentCollection();
            newComment.userID = user._id;
            newComment.topicID = req.body.topicID;
            newComment.text = req.body.text;
            newComment.save((err) => {
                if (err) {
                    console.log(err);
                    res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                        .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
                } else {
                    topic.comments.push(newComment._id);
                    topic.save((err) => {
                        if (err) {
                            console.log(err);
                            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                                .json({
                                    status: S.SERVERERR_INTERNAL_SERVER_ERROR,
                                    msg: 'Internal Server Error, Try again'
                                });
                        } else {
                            res.status(S.SUCCESS_OK)
                                .json({status: S.SUCCESS_OK, msg: 'success', result: {commentID: newComment._id}});
                        }
                    });
                }
            });
        });
}

exports.getTopics = (req, res, next) => {
    console.log('--getTopics--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if (!req.query.category) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Category is required.'});
        return;
    }

    TopicCollection.find({category: req.query.category})
        .populate({
            path: 'userID',
            select: 'firstName lastName displayPicture'
        })
        .exec((err, topics) => {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                var result = topics.map((topic) => {
                    return {
                        topicID: topic._id,
                        userID: topic.userID,
                        image: topic.image,
                        text: topic.text,
                        heart: topic.hearts.length,
                        commentsCount: topic.comments.length,
                        createdDate: topic.createdDate,
                        liked: topic.hearts.indexOf(user._id) !== -1
                    };
                });
                res.status(S.SUCCESS_OK)
                    .json({status: S.SUCCESS_OK, msg: 'success', result});
            }
        });
};

exports.getComments = (req, res, next) => {
    console.log('--getComments--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if (!req.query.topicID) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    CommentCollection.find({topicID: req.query.topicID})
        .populate({
            path: 'userID',
            select: 'firstName lastName displayPicture'
        }).exec((err, comments) => {
        if (err) {
            console.log(err);
            res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
        } else {
            var result = comments.map((comment) => {
                return {
                    commentID: comment._id,
                    userID: comment.userID,
                    text: comment.text,
                    heart: comment.hearts.length,
                    createdDate: comment.createdDate,
                    liked: comment.hearts.indexOf(user._id) !== -1
                };
            });
            res.status(S.SUCCESS_OK)
                .json({status: S.SUCCESS_OK, msg: 'success', result});
        }
    })
};

exports.like = (req, res, next) => {
    console.log('--like--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if (!req.query.type || !req.query.id) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    if (req.query.type == 0) {
        TopicCollection.findById(req.query.id, (err, topic) => {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                var index = topic.hearts.indexOf(user._id);
                if (index === -1)
                    topic.hearts.push(user._id);
                else
                    topic.hearts.splice(index, 1);
                topic.save((err) => {
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
        CommentCollection.findById(req.query.id, (err, comment) => {
            if (err) {
                console.log(err);
                res.status(S.SERVERERR_INTERNAL_SERVER_ERROR)
                    .json({status: S.SERVERERR_INTERNAL_SERVER_ERROR, msg: 'Internal Server Error, Try again'});
            } else {
                var index = comment.hearts.indexOf(user._id);
                if (index === -1)
                    comment.hearts.push(user._id);
                else
                    comment.hearts.splice(index, 1);
                comment.save((err) => {
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
};

exports.getCategoryTopicCount = (req, res, next) => {
    console.log('--getCategoryTopicCount--');
    let user = req.user;
    if (!user) {
        res.status(S.CLIENTERR_AUTHENTICATION)
            .json({status: S.CLIENTERR_AUTHENTICATION, msg: 'UnAuthorized'});
        return;
    }

    if (!req.query.mainCategory) {
        res.status(S.CLIENTERR_BAD_REQUEST)
            .json({status: S.CLIENTERR_BAD_REQUEST, msg: 'Parameter is not correct.'});
        return;
    }

    CategoryCollection.aggregate(
        {
            $match: {
                mainCategory: parseInt(req.query.mainCategory)
            }
        },
        {
            $project: {
                _id: 0,
                category: 1,
                topicCount: {$size: "$topics"}
            }
        }, (err, result) => {
            console.log(result);
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