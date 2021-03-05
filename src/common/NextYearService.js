const YearsDao = require('../years/years-dao-mysql');

let nextYearDateYear = "";

class NextYearService {

    getNextYear = async function (competition) {

        const yearsDao = new YearsDao();

        if (!nextYearDateYear || nextYearDateYear.length < 4) {
            try {
                const nextYear = await yearsDao.findNextYear(competition);
                if (nextYear && nextYear.isOk) { 
                    nextYearDateYear = nextYear.data.date.substring(0, 4);
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