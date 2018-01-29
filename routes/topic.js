var express = require('express');
var router = express.Router();
var passport = require('passport');
var Config = require('../components/configs');
var aws = require('aws-sdk'),
    multer = require('multer'),
    multerS3 = require('multer-s3');
const uuidv4 = require('uuid/v4');
const path = require('path');

aws.config.update({
    secretAccessKey: Config.AWS_S3.SECRET_ACCESS_KEY,
    accessKeyId: Config.AWS_S3.ACCESS_KEY_ID,
    region: 'ap-southeast-1'
});

var s3 = new aws.S3();

var uploadTopicImageManager = multer({
    storage: multerS3({
        s3: s3,
        bucket: Config.AWS_S3.BUCKET,
        key: function (req, file, cb) {
            var filename = uuidv4();
            var fileName = 'topic_pictures/' + filename + path.extname(file.originalname);
            cb(null, fileName); //use Date.now() for unique file keys
        }
    })
});

var topicController = require('../controllers/topic');

router.get('/getTopics', passport.authenticate('jwt', {session: false}), topicController.getTopics);
router.get('/getComments', passport.authenticate('jwt', {session: false}), topicController.getComments);
router.get('/like', passport.authenticate('jwt', {session: false}), topicController.like);
router.get('/getCategoryTopicCount', passport.authenticate('jwt', {session: false}), topicController.getCategoryTopicCount);
router.post('/createTopic', passport.authenticate('jwt', {session: false}), uploadTopicImageManager.single('image'),
    topicController.createTopic);
router.post('/addComment', passport.authenticate('jwt', {session: false}), topicController.addComment);

module.exports = router;
