/**
 * Created on 8/16/2017.
 */
'use strict';
var Config = require('../components/configs');
var client = require('twilio')(Config.Twilio.TWILIO_ACCOUNT_SID, Config.Twilio.TWILIO_AUTH_TOKEN);

module.exports.sendSms = function (to, message) {
    client.sendMessage({
        to: '+' + to,
        from: Config.Twilio.TWILIO_FROM_NUMBER,
        body: message,
    }, function (err, data) {
        if (err) {
            console.error('Could not notify administrator');
            console.error(err);
        } else {
            console.log('Administrator notified', to);
        }
    });
};