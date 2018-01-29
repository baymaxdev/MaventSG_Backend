"use strict";

/* BadRequestError constructor
 * Use it to break Promise chain early
 */
function BadRequestError({custom_message,
                          custom_code}) {
  this.custom_message = custom_message
  this.custom_code = custom_code
};

BadRequestError.prototype.toHash = function() {
  return {
    success: false,
    custom_message: this.custom_message,
    custom_code: this.custom_code
  }
};

module.exports = BadRequestError
