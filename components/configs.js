/**
 * Created on 8/16/2017.
 */

module.exports = {
    AccountType: {
        consumer: 0,
        maven: 1
    },
    MavenMainCategory: {
        skill: 0,
        service: 1
    },
    CustomerType: {
        Direct: 0,
        Indirect: 1
    },
    LeadSourceType: {
        Partner: 0,
        Ecommerce: 1,
        SalesOps: 2
    },
    InhalerType: {
        Control: 0,
        Rescue: 1,
        Both: 2
    },
    StatusType: {
        Inactive: 0,
        Active: 1,
        Blocked: 2,
        Initialized: 3,
        Lost: 4
    },
    OrderStatusType: {
        Pending: 0,
        Intrasit: 1,
        Shipped: 2,
        Delivered: 3,
        Cancelled: 4,
        Onhold: 5
    },
    InhalerStausType: {
        Initialized: 0,
        Active: 1,
        Lost: 2,
        Blocked: 3,
        Found: 4,
        Inactive: 5
    },
    DoseStatusType: {
        Inactive: 0,
        Active: 1,
        Missed: 2,
        Taken: 3,
        OverDose: 4,
        DoseAttempted: 5,
        Delayed: 6,
    },
    ScoreAndCoutStatusType: {
        Taken: 0,
        Missed: 1,
        IncorrectlyTaken: 2,
        OverDose: 3,
        Rescue: 4,
        Delayed: 5,
    },
    CalculateStatusType: {
        Initialized: 0,
        NotStarted: 1,
        Completed: 2,
        Exception: 3,
        InhalerBlocked: 4,
        InhalerLost: 4,
    },
    MavenStatusType: {
        Pending: 0,
        Approved: 1,
        Rejected: 2
    },
    ActivityStatusType: {
        Messaged: 0,
        Offered: 1,
        Accepted: 2,
        Rejected: 3,
        Cancelled: 4,
        Completed: 5,
        ConsumerReviewed: 6,
        MavenReviewed: 7,
        BothReviewed: 8,
        Archived: 9
    },
    Gender: {
        Male: 0,
        Female: 1,
        Undefined: 2
    },
    Twilio: {
        TWILIO_ACCOUNT_SID: 'X',
        TWILIO_AUTH_TOKEN: 'X',
        TWILIO_FROM_NUMBER: 00000000000
    },
    Facebook: {
        APP_ID: 'X',
        APP_SECRET: 'X'
    },
    DayOfWeek: {
        Monday: 0,
        Tuesday: 1,
        Wednesday: 2,
        Thursday: 3,
        Friday: 4,
        Saturday: 5,
        Sunday: 6
    },
    TimeAvailable: {
        Morning: 0,
        Afternoon: 1,
        Evening: 2,
        Night: 3
    },
    ExpirationTime: {
        linkKey: 24 * 60 * 60 * 1000,
        otp: 5 * 60 * 1000
    },
    Auth: {
        SECRET_KEY: 'X'
    },
    AWS_S3: {
        BUCKET: process.env.ME_CONFIG_S3_BUCKET_NAME || 'X',
        ACCESS_KEY_ID: process.env.ME_CONFIG_S3_ACCESS_KEY_ID || 'X',
        SECRET_ACCESS_KEY: process.env.ME_CONFIG_S3_SECRET_ACCESS_KEY || 'X'
    },
    GOOGLE_API_KEY: 'X'
};
