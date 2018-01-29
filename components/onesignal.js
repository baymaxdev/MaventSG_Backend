/**
 * Created on 8/16/2017.
 */
//var oneSignal = require('onesignal')('[apiKey]', '[appId]', true);
var OneSignal = require('onesignal')('ZmE4NjcyYzctYTc0YS00OGFlLWE4ODEtNzZiNjI2YzUyNjcz', 'f27ede67-0102-469e-a358-4afef9a07d23', false);
var async = require('async');
exports.addDevice = function (deviceToken, osType, user, callback) {
    console.log('addDevice call', deviceToken, osType, user.loginDetailObject.username);
    async.waterfall([
            function (next) {
                if (user.loginDetailObject.deviceToken != deviceToken || !user.loginDetailObject.oneSignalID) {
/*
                    if (!user.loginDetailObject.oneSignalID) {
                        OneSignal.addDevice(deviceToken, osType)
                            .then(function (objectId) {
                                console.log('-onesignal-addDevice-then', objectId);
                                next(null, objectId);
                            })
                            .catch(function (reason) {
                                console.log('-onesignal-addDevice-catch', reason);
                                next(reason);
                            });

                    } else {
                        OneSignal.editDevice(user.loginDetailObject.oneSignalID, deviceToken)
                            .then(function (objectId) {
                                console.log('-onesignal-editDevice-then', objectId);
                                next(null, objectId);
                            })
                            .catch(function (reason) {
                                console.log('-onesignal-editDevice-catch', reason);
                                next(reason);
                            });
                    }
*/
                    OneSignal.addDevice(deviceToken, osType)
                        .then(function (objectId) {
                            console.log('-onesignal-addDevice-then', objectId);
                            next(null, objectId);
                        })
                        .catch(function (reason) {
                            console.log('-onesignal-addDevice-catch', reason);
                            next(reason);
                        });
                } else {
                    next('already registered');
                }
             },
            function (oneSignalID, next) {
                console.log('-- addDevice', 'save doneSignalID');
                user.loginDetailObject.deviceToken = deviceToken;
                user.loginDetailObject.oneSignalID = oneSignalID.toString();
                user.save(function (err) {
                    next(err);
                });
            }
        ],
        function (err) {
            callback(err);
        }
    );
}
exports.send = function (msg, table, status, receiver) {
    console.log('--onesignal', 'send:', table, status, receiver.loginDetailObject.oneSignalID);
    var message = msg;
    var data = {};
    data.table = table;
    data.status = status;
    if (receiver.loginDetailObject.oneSignalID) {
        var oneSignalIDs = [];
        oneSignalIDs.push(receiver.loginDetailObject.oneSignalID);
        //oneSignalIDs.push('bfa07c54-4d9a-43b4-9ebe-63c68b622e77');
        OneSignal.createNotification(message, data, oneSignalIDs)
            .then(function (resolve) {
                console.log('onesignal success', receiver.loginDetailObject.username, resolve);
            })
            .catch(function (reason) {
                console.log('onesignal-send', reason);
                next(reason);
            });
    } else {
        console.log('onesignal send failed', receiver.loginDetailObject.username, 'no onSignalID');
    }

}
