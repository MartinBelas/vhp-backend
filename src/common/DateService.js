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