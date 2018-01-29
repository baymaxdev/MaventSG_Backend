/**
 * Created on 8/16/2017.
 */
var mongoose = require('mongoose');
String.prototype.startsWith = function (prefix) {
    return this.slice(0, prefix.length) === prefix;
};

String.prototype.endsWith = function (suffix) {
    return this.length >= suffix.length && this.substr(this.length - suffix.length) === suffix;
};

String.prototype.contains = function (str) {
    return this.indexOf(str) > -1;
}

String.prototype.getTags = function (tag) {
    var m = undefined;
    if (tag === '@') {
        m = this.match(/@\w+/g);
    }
    if (m === undefined || m === null) return [];
    else return m;
};

String.prototype.stripAlphaChars = function () {
    var out = this.replace(/[^0-9]/g, '');
    return out;
}

exports.getDayTimeStamp = function (d) {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return d.getTime();
};

exports.getCurrentTimeStamp = function () {
    var hrTime = process.hrtime();
    //return hrTime[0] * 1000000 + hrTime[1] / 1000;
    return hrTime[0] * 1000000000 + hrTime[1];
};

exports.validateDate = function (d) {
    return /^(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])\-\d{4}$/.test(d); //MM-dd-yyyy
};
exports.validateDate1 = function (d) {
    return /^(0?[1-9]|[12][0-9]|3[01])\-(0?[1-9]|1[012])\-\d{4}$/.test(d); //dd-mm-yyyy
};
exports.validateTime = function (t) {
    return /^([2][0-3]|[01]?[0-9])([.:][0-5][0-9])?$/.test(t); //hh:mm
};
exports.validateDoseTime = function (t) {
    //return /^([2][0-3]|[01]?[0-9])(am|pm)?$/.test(t); //hh(a|p)m
    return /^([2][0-3]|[01]?[0-9])([.:][0-5][0-9])AM|PM?$/.test(t); //hh:mm(a|p)m
};
exports.isDoseTimeAM = function (t) {
    //return /^([2][0-3]|[01]?[0-9])(am|pm)?$/.test(t); //hh(a|p)m
    return /^([2][0-3]|[01]?[0-9])([.:][0-5][0-9])AM?$/.test(t); //hh:mm(a|p)m
};

exports.validateDateTime = function (dt) {
    return /^(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])\-\d{4} ([2][0-3]|[01]?[0-9])([.:][0-5][0-9])([.:][0-5][0-9])?$/.test(dt); //MM-dd-yyyy hh:mm:ss
};

exports.validateColorCode = function (c) {
    return /^([A-Fa-f0-9]{2}){3}$/.test(c); //RRGGBB
};

/*
 All time should be manipulated as UTC timezone
 */
exports.dateTimeFromString = function (d, t) {
    var date = d.split('-');
    var time = t.split(':');
    return new Date(Date.UTC(+date[0], (+date[1]) - 1, +date[2], +time[0], +time[1]));
};
exports.dateTimeFromString1 = function (d, t) {
    var date = d.split('-');
    var time = t.split(':');
    return new Date(Date.UTC(+date[2], (+date[1]) - 1, +date[0], +time[0], +time[1]));
};

exports.dateTimeFromStringLong = function (dt) {
    var d = dt.split(' ')[0];
    var t = dt.split(' ')[1];
    return this.dateTimeFromString(d, t);
};

exports.minutesFromString = function (t) {
    var h = t.split(':')[0];
    var m = t.split(':')[1];
    return (+h) * 60 + (+m);
};
exports.hourFromDoseTimeString = function (t) {
    var hour = Number(t.split(':')[0]);
    console.log('--check-hourFromDoseTimeString', hour);
    if (this.isDoseTimeAM(t)) {
        return hour;
    } else {
        return hour + 12;
    }
};
exports.minFromDoseTimeString = function (t) {
    var mam = Number(t.split(':')[1].split('A')[0]);
    var mpm = Number(t.split(':')[1].split('P')[0]);
    console.log('--check-minFromDoseTimeString', mam, mpm);
    if (!isNaN(mam)) return mam;
    if (!isNaN(mpm)) return mpm;
};

exports.stringFromDate = function (date, format, utc) {
    var dateFormatter = require('dateformat');
    return dateFormatter(date, format, utc);
};

exports.dayOfWeekFromDate = function (date) {
    var moment = require('moment');
    var day = moment(this.stringFromDate(date, 'yyyy-mm-dd', true));
    var dayOfWeek = day.isoWeekday();
    return dayOfWeek == 7 ? 1 : dayOfWeek + 1;
};

exports.getDateDaysDiff = function (d, n) {
    var date = new Date(d);
    date.setDate(date.getDate() + n);
    return date;
};
exports.getArrayLength = function (array) {
    var len = 0;
    console.log('-check1-', array);
    do {
        var element = array.split(',');
        if (element != undefined) {
            len++;
        } else {
            break;
        }
    } while (1)
    return len;
}
exports.isObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
}
