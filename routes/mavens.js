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

var uploadMavenImageManager = multer({
    storage: multerS3({
        s3: s3,
        bucket: Config.AWS_S3.BUCKET,
        key: function (req, file, cb) {
            console.log(file);
            var filename = uuidv4();
            if(file.fieldname == 'idPictures')
                fileName = 'id_pictures/' + filename + path.extname(file.originalname);
            else
                fileName = 'maven_pictures/' + filename + path.extname(file.originalname);
            cb(null, fileName); //use Date.now() for unique file keys
        }
    })
});


var mavenController = require('../controllers/maven');

/* GET users listing. */
// router.get('/', function (req, res, next) {
//     res.send('respond with a resource');
// });

router.post('/registerMaven', passport.authenticate('jwt', {session: false}), uploadMavenImageManager.fields([
    { name: 'idPicture1', maxCount: 1 },
    { name: 'idPicture2', maxCount: 1},
    { name: 'idPicture3', maxCount: 1},
    { name: 'picture1', maxCount: 1 },
    { name: 'picture2', maxCount: 1 },
    { name: 'picture3', maxCount: 1 }
]), mavenController.registerMaven);
router.post('/editMavenDetails', passport.authenticate('jwt', {session: false}), mavenController.editMaven);
router.get('/deleteMaven', passport.authenticate('jwt', {session: false}), mavenController.deleteMaven);
router.get('/changeActive', passport.authenticate('jwt', {session: false}), mavenController.changeActive);
router.get('/deactivate', passport.authenticate('jwt', {session: false}), mavenController.deactivate);
router.get('/getMavenDetails', passport.authenticate('jwt', {session: false}), mavenController.getMavenDetails);
router.post('/addMavenImage', passport.authenticate('jwt', {session: false}), uploadMavenImageManager.array('image', 1),
    mavenController.addMavenImage);
router.get('/deleteMavenImage', passport.authenticate('jwt', {session: false}), mavenController.deleteMavenImage);
router.get('/getNearbyList', passport.authenticate('jwt', {session: false}), mavenController.getNearbyList);
router.get('/getCatListing', passport.authenticate('jwt', {session: false}), mavenController.getCatListing);
router.post('/report', passport.authenticate('jwt', {session: false}), mavenController.reportMaven);
module.exports = router;
