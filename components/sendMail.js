var path = require('path');
var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;
var smtpTransport = require('nodemailer-smtp-transport');
var xoauth2 = require('xoauth2');

exports.Admin = "";

var templateDir   = path.join(__dirname, '../templates', 'mail');
var template = new EmailTemplate(templateDir);

// transport = nodemailer.createTransport(smtpTransport({
//     service: 'gmail',
//     auth: {
//         user: 'TopGuruofdevelopment@gmail.com', //email
//         pass: 'TopGuruAssistants@2017!' //password
//     },
// }));

var transport = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'support@mavent.co',
        pass: 'Password!'
    }
});

exports.sendMail = function(to, subject, plain_body, html_body, preview, link, link_title) {
    plain_body = plain_body || null;
    html_body = html_body || null;
    preview = preview || null;
    link = link || null;
    link_title = link_title || null;

    template.render({to: to, subject: subject, plain_body: plain_body, html_body:html_body, preview:preview, link:link, link_title: link_title}, function (err, results) {
        if (err) {
            console.error(err);
            return;
        }

        transport.sendMail({
            from: 'Kris from Mavent <support@mavent.co>',
            to: to,
            subject: subject,
            subject: subject,
            html: results.html
        }, function (err, responseStatus) {
            if (err) {
                console.error(err);
            }
        });
    });
};

// sendMail('kriszlee1991@gmail.com', 'Warm welcome from Mavent', null, '<p>Dear Kris,</p><br /><p>Welcome to the Mavent community. To fully unleash the power of Mavent, click on the link below to enhance your profile</p><p>See you mingle around in the community and stay tuned for more updates and freebies!', 'Warm welcome from our community', 'http://www.google.com', 'Update your profile');
