'use strict';

const dbConnection = require('../mysqlDbConnection');
const { YearBuilder } = require('./year');
const { CategoryBuilder } = require('./categories/category');
const { RaceBuilder } = require('./races/race');

function getYearsQueries(competitionPrefix) {
    const tblName = competitionPrefix + `Years`;
    return {
        insertRow: `INSERT INTO ` + tblName + ` (vhpYear, vhpCounter, vhpDate, acceptRegistrations) VALUES(?,?,?,?)`,
        readAllRows: `SELECT vhpYear, DATE_FORMAT(vhpDate, '%Y-%m-%d') as vhpDate, vhpCounter, acceptRegistrations FROM ` + tblName,
        readLastYearRow: `SELECT vhpYear, DATE_FORMAT(vhpDate, '%Y-%m-%d') as vhpDate, vhpCounter, acceptRegistrations FROM ` + tblName + ` WHERE vhpYear=(SELECT MAX(vhpYear) FROM ` + tblName + `)`,
        readRow: `SELECT * FROM ` + tblName + ` WHERE vhpYear = ?`,
        readLastCounterValue: `SELECT vhpCounter FROM ` + tblName + ` WHERE vhpCounter=(SELECT MAX(vhpCounter) FROM ` + tblName + `)`,
        readNextYearValue: `SELECT vhpDate, vhpCounter FROM vhpYears WHERE vhpDate=(SELECT MAX(vhpDate) FROM vhpYears) AND vhpDate>CURDATE()`
        //readNextDateRow: `SELECT vhpCounter FROM ` + tblName + ` WHERE vhpCounter=(SELECT MAX(vhpCounter) FROM ` + tblName + `)`
        //updateRow: `UPDATE Years SET Years.vhpDate = ?, Years.acceptRegistrations WHERE Years.vhpYear = ?`,
        //deleteRow: `DELETE FROM Years WHERE Years.vhpYear = ?`
    }
}

function getCategoriesQueries(competitionPrefix, year) {
    const tblName = competitionPrefix + `Categories` + year;
    return {
        createTable: `CREATE TABLE ` + tblName + ` (id varchar(4), description varchar(50))`,
        insertRow: `INSERT INTO ` + tblName + ` (id, description) VALUES(?,?)`,
        readAllRows: `SELECT * FROM ` + tblName,
        //updateRow: `UPDATE Years SET Years.vhpDate = ?, Years.acceptRegistrations WHERE Years.vhpYear = ?`,
        //deleteRow: `DELETE FROM Years WHERE Years.vhpYear = ?`
    }
}

function getRacesQueries(competitionPrefix, year) {
    const tblName = competitionPrefix + `Races` + year;
    return {
        createTable: `CREATE TABLE ` + tblName + ` (id int, name varchar(50))`,
        insertRow: `INSERT INTO ` + tblName + ` (id, name) VALUES(?,?)`,
        readAllRows: `SELECT * FROM ` + tblName,
        //updateRow: `UPDATE Years SET Years.vhpDate = ?, Years.acceptRegistrations WHERE Years.vhpYear = ?`,
        //deleteRow: `DELETE FROM Years WHERE Years.vhpYear = ?`
    }
}

function getRunnersQueries(competitionPrefix, year) {
    const tblName = competitionPrefix + `Runners` + year;
    const command = `CREATE TABLE IF NOT EXISTS ` + tblName + ` (
        id VARCHAR(36) PRIMARY KEY, 
        email varchar(50),
        firstname varchar(30),
        lastname varchar(30),
        birth varchar(12),
        sex varchar(1),
        address varchar(255),
        phone varchar(20),
        club varchar(255),
        race varchar(32),
        comment blob,
        paid tinyint(1),
        category varchar(3),
        number int(3),
        time varchar(8),
        create_time timestamp
    )`;
    
    return {
        createTable: command
    }
}


let builder = new YearBuilder();
let categoryBuilder = new CategoryBuilder();
let raceBuilder = new RaceBuilder();

module.exports = class YearsDao {

    async getDbConnection() {
        if (!this.dbConnectionConfig) {
            throw new Error('dbConnectionConfig is missing.');
        }
        let con = await this.dbConnectionConfig();
        return con;
    }

    async create(competition, newEntity) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            const acceptRegistrations = newEntity.acceptRegistrations === true ? newEntity.acceptRegistrations : false;
            await con.query(
                getYearsQueries(competition).insertRow,
                [newEntity.vhpYear, newEntity.vhpCounter, newEntity.vhpDate, acceptRegistrations]
            );
            await con.query(
                getCategoriesQueries(competition, newEntity.vhpYear).createTable
            );
            newEntity.categories.forEach(category => {
                con.query(
                    getCategoriesQueries(competition, newEntity.vhpYear).insertRow,
                    [category.id, category.description]
                );
            });
            await con.query(
                getRacesQueries(competition, newEntity.vhpYear).createTable
            );
            newEntity.races.forEach(race => {
                con.query(
                    getRacesQueries(competition, newEntity.vhpYear).insertRow,
                    [race.id, race.description]
                );
            });
            await con.query(
                getRunnersQueries(competition, newEntity.vhpYear).createTable
            );
            await con.query("COMMIT");
            return newEntity;
        } catch (ex) {
            await con.query("ROLLBACK");
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async find(competition) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRows = await con.query(getYearsQueries(competition).readAllRows);
            await con.query("COMMIT");

            if (!dbRows) {
                throw { "message": "No data from db." };
            }

            let entities = dbRows.map(row => {
                return this.build(row);
            });
            return entities;
        } catch (ex) {
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async findLastCounter(competition) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let lastCounter = await con.query(getYearsQueries(competition).readLastCounterValue);
            await con.query("COMMIT");

            lastCounter = lastCounter[0].vhpCounter;
            
            if (!lastCounter) {
                return {
                    "suggestedStatus": 404,
                    "error": {
                        "message": "Last counter not found."
                    }
                }
            }

            return lastCounter;
        } catch (e) {
            console.log("ERROR when obtaining last counter: ", e.message);
            console.log(e);
            throw e;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async findLast(competition) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRowYear = await con.query(getYearsQueries(competition).readLastYearRow);
            let entity = this.build(dbRowYear[0]);
            await con.query("COMMIT");

            if (!dbRowYear) {
                return {
                    "suggestedStatus": 404,
                    "error": {
                        "message": "Last year not found."
                    }
                }
            }

            if (typeof dbRowsCategories !== 'undefined') {
                const categories = [];
                dbRowsCategories.map(row => {
                    categories.push(this.buildCategory(row));
                });
                if (categories.length > 0) entity.setCategories(categories);
            }

            if (typeof dbRowsRaces !== 'undefined') {
                const races = [];
                dbRowsRaces.map(row => {
                    races.push(this.buildRace(row));
                });
                if (races.length > 0) entity.setRaces(races);
            }

            return entity;
        } catch (ex) {
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async findNextYear(competition) {
        let nextYear;
        try {
            let con = await dbConnection();
            await con.query("START TRANSACTION");
            nextYear = await con.query(getYearsQueries(competition).readNextYearValue);
            await con.query("COMMIT");


            if (!nextYear || nextYear.length < 1) {
                return {
                    "suggestedStatus": 404,
                    "error": {
                        "message": "Next year not found."
                    }
                }
            }

            let nextYearDate = nextYear[0].vhpDate;
            const nextYearCounter = nextYear[0].vhpCounter;

            let month = nextYearDate.getMonth()+1;
            if (month < 10) month = "0"+month;
            nextYearDate = nextYearDate.getFullYear()+"-"+month+"-"+nextYearDate.getDate();
            
            nextYear = {
                "date": nextYearDate,
                "counter": nextYearCounter
            }
            
            return nextYear;
        } catch (err) {
            console.log("ERR years dao - when obtaining next year: ", err.message);
            throw err;
            //await Promise.reject(nextYear);
        } finally {
            if (typeof con !== 'undefined' && con) {
                await con.release();
                await con.destroy();
            }
        }
    }

    async findById(competition, id) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRow = (await con.query(queries.readRow, [id]))[0];
            await con.query("COMMIT");

            if (!dbRow) {
                return {
                    "suggestedStatus": 404,
                    "error": {
                        "message": "Year " + id + " not found."
                    }
                }
            }
            let entity = this.build(row);
            return entity;
        } catch (ex) {
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async update(entity) {
        return {
            "suggestedStatus": 400,
            "error": {
                "message": "This operation is not supported."
            }
        }
    }

    async remove(id) {
        return {
            "suggestedStatus": 400,
            "error": {
                "message": "This operation is not supported."
            }
        }
    }

    build(row) {
        return builder
            .setVhpYear(row.vhpYear)
            .setVhpDate(row.vhpDate)
            .setVhpCounter(row.vhpCounter)
            .setAcceptRegistrations(row.acceptRegistrations)
            .build();
    }

    buildCategory(row) {
        return categoryBuilder
            .setId(row.id)
            .setDescription(row.description)
            .build();
    }

    buildRace(row) {
        return raceBuilder
            .setId(row.id)
            .setName(row.name)
            .build();
    }
};
