var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


module.exports = {

	sendMessage : function(user_phone_number, message, callback_sendMessage) {
		client.sendMessage({

			from: process.env.TWILIO_PHONE_NUMBER,
			to: user_phone_number, //	phoneNumber
			body: message
		}, function(err, messageSent) {
			if (err) {

				sails.log.error(err);
				callback_sendMessage(err, null);
			} else {
				// console.log(messageSent);
				callback_sendMessage(null, messageSent);
			}
		});
	}
}
