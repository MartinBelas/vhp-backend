const YearsDao = require('../years/years-dao-mysql');

let nextYearDateYear = "";

class NextYearService {

    getNextYear = async function (competition) {

        const yearsDao = new YearsDao();

        if (!nextYearDateYear) {
            try {
                const nextYear = await yearsDao.findNextYear(competition);
                if (nextYear && nextYear.date) { 
                    nextYearDateYear = nextYear.date.substring(0, 4);
                }
            } catch (err) {
                console.log('ERR NextYearService.getNextYear: ', err);
                throw err;
            }
        }

        return nextYearDateYear;
    }
}

module.exports = new NextYearService();