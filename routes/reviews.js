var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var Config = require('../components/configs');
var aws = require('aws-sdk'),
    multer = require('multer'),
    multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: Config.AWS_S3.SECRET_ACCESS_KEY,
    accessKeyId: Config.AWS_S3.ACCESS_KEY_ID,
    region: 'ap-southeast-1'
});

var app = express(),
    s3 = new aws.S3();

var uploadMavenImagewManager = multer({
    storage: multerS3({
        s3: s3,
        bucket: Config.AWS_S3.BUCKET,
        key: function (req, file, cb) {
            var filename = uuidv4();
            console.log(file);
            var fileName = 'maven_pictures/' + filename + path.extname(file.originalname);
            cb(null, fileName); //use Date.now() for unique file keys
        }
    })
});


var mavenController = require('../controllers/maven');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/addMaven', passport.authenticate('jwt', {session: false}), mavenController.addMaven);
router.get('/getMavenDetails', passport.authenticate('jwt', {session: false}), mavenController.getMavenDetails);
router.post('/uploadMavenImage', uploadProfileImagewManager.array('photo', 1), mavenController
    .uploadMavenImage);
module.exports = router;
