const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
            })
            .catch((error) => {
                console.error(' ERR - send email error: ', error);
            })
    }
}

module.exports = new EmailService()