var express = require('express');
var router = express.Router();
var passport = require('passport');

var activityController= require('../controllers/activity');

router.get('/init-chat', passport.authenticate('jwt', {session: false}), activityController.initChat);
router.get('/createOffer', passport.authenticate('jwt', {session: false}), activityController.createOffer);
router.get('/acceptOffer', passport.authenticate('jwt', {session: false}), activityController.acceptOffer);
router.get('/rejectOffer', passport.authenticate('jwt', {session: false}), activityController.rejectOffer);
router.get('/editOffer', passport.authenticate('jwt', {session: false}), activityController.editOffer);
router.get('/cancelOffer', passport.authenticate('jwt', {session: false}), activityController.cancelOffer);
router.get('/end', passport.authenticate('jwt', {session: false}), activityController.end);
router.get('/getActivities', passport.authenticate('jwt', {session: false}), activityController.getActivities);
router.get('/archive', passport.authenticate('jwt', {session: false}), activityController.archive);

module.exports = router;
