var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');
var requestIp = require('request-ip');
var passport = require('passport');
var multiparty = require('connect-multiparty');

var routes = require('./routes/index');
var users = require('./routes/users');
var mavens = require('./routes/mavens');
var topics = require('./routes/topic');
var activities = require('./routes/activities');
var app = express();

var Config = require('./components/configs');


var allowCrossDomain = function(req, res, next) {
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }

    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //res.header('Access-Control-Allow-Headers', '*');
    //
    //next();
}

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// app.use(bodyParser.raw({type: 'application/vnd.custom-type'}));
// app.use(bodyParser.text({type: 'text/html'}));
// app.use(multiparty());
app.use(allowCrossDomain);
app.use(cookieParser());
app.use(session({
    secret: 'ghw462~!@#$%^&*()_+|', // just a long random string
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

var mongo_express = require('mongo-express/lib/middleware');
var mongo_express_config = require('./components/mongo_express_config');
app.use('/mavent/admin', mongo_express(mongo_express_config));

process.env.TMP = path.join(__dirname, './temp');
process.env.TEMP = path.join(__dirname, './temp');
process.env.TMPDIR = path.join(__dirname, './temp');

// var multiparty = require('connect-multiparty');
// app.use(multiparty())
// app.use('/', routes);


// global.appRoot = path.resolve(__dirname);


var mongoose = require('mongoose');
var promise = require('bluebird');
mongoose.Promise = promise;
var mongoHost = process.env.ME_CONFIG_MONGODB_SERVER || 'localhost';
var mongoPort = process.env.ME_CONFIG_MONGODB_PORT || '27017';
var mongoDb = process.env.ME_CONFIG_MONGODB_AUTH_DATABASE || 'mavent';
var mongooseConnectionString = 'mongodb://'+mongoHost+':'+mongoPort+'/'+mongoDb;
var options = {
    user: process.env.ME_CONFIG_MONGODB_AUTH_USERNAME || 'mavent',
    pass: process.env.ME_CONFIG_MONGODB_AUTH_PASSWORD || 'mavent'
};

mongoose.connect(mongooseConnectionString, options, function (err) {
    console.log("mongoose trying to connect to mongodb : " + mongooseConnectionString);
    if (err) {
        console.log('mongoose connection error :' + err);
        throw err;
    } else {
        console.log('success');
    }
});

process.on('uncaughtException', function (err) {
    console.log("-------------uncaughtException------------\n " + err.stack);
});

/*******************
 * API List
 ******************/
// Init passport
app.use(passport.initialize());
require('./services/passport')(passport);

// var userController = require('./controllers/user');
// app.post('/user/register', userController.register);
// app.get('/user/logIn', userController.logIn);
// app.get('/user/getUser', passport.authenticate('jwt', {session: false}), userController.getUser);

//Route
app.use('/', routes);
app.use('/user', users);
app.use('/maven', mavens);
app.use('/topic', topics);
app.use('/activity', activities);
app.use(requestIp.mw({ attributeName : 'myCustomAttributeName' }));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status)
        .json({
        'error': {
            message: err.message,
            error: {}
        }
    });
});


module.exports = app;
