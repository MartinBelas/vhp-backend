class DateService {

    // return timestamp in seconds
    getTimestamp() {
        return Date.now() / 1000;
    }

    isValid(olderTimestamp, period) {
        return ((olderTimestamp + period) > (Date.now() / 1000));
    }

    isInFuture(nextYearDate) {
        const dateNow = new Date(Date.now());
        const currentDate = dateNow.toISOString().substring(0, 10);
        return nextYearDate >= currentDate;
    }
}

module.exports = new DateService()