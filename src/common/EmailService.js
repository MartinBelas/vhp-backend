const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { ResultBuilder } = require('./result');

const sender_email = "vh-pulmaraton@seznam.cz";

class EmailService {

    sendMail(to, subject, text) {

        const msg = {
            from: sender_email,
            to: to,
            subject: subject,
            text: text
        }

        sgMail
            .send(msg)
            .then(() => {
                return new ResultBuilder()
                    .setIsOk(true)
                    .setSuggestedStatus(200)
                    .setErrMessage('Email to ' + to + ' sent.')
                    .build();
            })
            .catch((error) => {
                console.error(' ERR - EmailService sendMail error: ', error);
                return new ResultBuilder()
                    .setIsOk(false)
                    .setSuggestedStatus(500)
                    .setErrMessage('Cannot send email to: ' + to)
                    .build();
            })
    }
}

module.exports = new EmailService()