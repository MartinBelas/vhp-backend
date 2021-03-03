const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sender_email = "vh-pulmaraton@seznam.cz";

class DateService {

    // return timestamp in seconds
    getTimestamp() {
        return Date.now() / 1000;
    }

    isValid(olderTimestamp, period) {
        return ((olderTimestamp + period) > (Date.now() / 1000));
    }
}

module.exports = new DateService()