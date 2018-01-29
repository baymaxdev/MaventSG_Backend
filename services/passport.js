const UserCollection = require('../models/UserCollection');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportJWT = require("passport-jwt");
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = passportJWT.Strategy;

var Config = require('../components/configs');
var ExtractJwt = passportJWT.ExtractJwt;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: Config.Auth.SECRET_KEY,
    ignoreExpiration: false
}, function(jwtPayload, done) {
    UserCollection.findById(jwtPayload.id, {}, function(err, user) {
        if (!user) return done(null, false);
        console.log('user_id: ',user._id);
        return done(null, user);
    });
}));

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'     
    },
    function(email, password, done) {
        User.findOne({email: email}, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Unknown user ' + err}); }
            var isMatch = user.authenticate(password);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });    
    }
));

passport.use('facebook', new FacebookStrategy({
    clientID: Config.Facebook.APP_ID,
    clientSecret: Config.Facebook.APP_SECRET,
    callbackURL: '-',
    consumerSecret: '-',
    passReqToCallback : true
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, {
        fbId: profile.id,
        // firstName: profile.name.givenName, 
        // lastName: profile.name.familyName,
        email: profile.emails[0].value
    });
  }
));

passport.use('facebook-token', new FacebookTokenStrategy({
    clientID: Config.Facebook.APP_ID,
    clientSecret: Config.Facebook.APP_SECRET
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, {
        fbId: profile.id,
        email: profile.emails[0].value,
        profile: profile
    });
  }
));

module.exports = function() {
    return passport;
};