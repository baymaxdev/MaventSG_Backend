var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
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

var updateProfileImageManager = multer({
    storage: multerS3({
        s3: s3,
        bucket: Config.AWS_S3.BUCKET,
        key: function (req, file, cb) {
            console.log('-- uploaded file --\n', file);
            var fileName = 'profile_pictures/' + req.user._id.toString() + '.jpg';
            cb(null, fileName); //use Date.now() for unique file keys
        }
    })
});

var uploadProfileImageManager = multer({
    storage: multerS3({
        s3: s3,
        bucket: Config.AWS_S3.BUCKET,
        key: function (req, file, cb) {
            var filename = uuidv4();
            console.log('-- uploaded file --\n', file);
            var fileName = 'profile_pictures/' + filename + path.extname(file.originalname);
            cb(null, fileName); //use Date.now() for unique file keys
        }
    })
});

var userController = require('../controllers/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', uploadProfileImageManager.single('photo'), userController.register);
router.post('/login', userController.login);
router.get('/login/facebook', passport.authenticate('facebook-token'), userController.loginFacebook);
router.get('/generateOtp', userController.generateOtp);
router.get('/verifyOtp', userController.verifyOtp);
router.get('/forgotPassword', userController.forgotPassword);
router.post('/resetPassword', userController.resetPassword);
router.put('/uploadProfileImage', passport.authenticate('jwt', {session: false}), updateProfileImageManager.array('photo', 1), userController
	.updateProfileImage);
router.post('/uploadProfileImage', passport.authenticate('jwt', {session: false}), uploadProfileImageManager.array('photo', 1), userController
    .uploadProfileImage);
router.get('/getProfileDetails', passport.authenticate('jwt', {session: false}), userController.getProfileDetails);
router.get('/getPostalCode', passport.authenticate('jwt', {session: false}), userController.getPostalCode);
router.get('/checkID', passport.authenticate('jwt', {session: false}), userController.checkID);
router.get('/changePhoneNumber', userController.changePhoneNumber);
router.get('/editAbout', passport.authenticate('jwt', {session: false}), userController.editAbout);
router.get('/saveMaven', passport.authenticate('jwt', {session: false}), userController.saveMaven);
router.get('/saved-mavens', passport.authenticate('jwt', {session: false}), userController.getSavedMavens);

module.exports = router;
