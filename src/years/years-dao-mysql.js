'use strict';

const dbConnection = require('../mysqlDbConnection');
const { YearBuilder } = require('./year');
const { CategoryBuilder } = require('./categories/category');
const { RaceBuilder } = require('./races/race');

function getYearsQueries(competitionPrefix) {
    const tblName = competitionPrefix + `Years`;
    return {
        insertRow: `INSERT INTO ` + tblName + ` (vhpYear, vhpDate, acceptRegistrations) VALUES(?,?,?)`,
        readAllRows: `SELECT vhpYear, DATE_FORMAT(vhpDate, '%Y-%m-%d') as vhpDate, acceptRegistrations FROM ` + tblName,
        readLastYearRow: `SELECT vhpYear, DATE_FORMAT(vhpDate, '%Y-%m-%d') as vhpDate, acceptRegistrations FROM ` + tblName + ` WHERE vhpYear=(SELECT MAX(vhpYear) FROM ` + tblName + `)`,
        readRow: `SELECT * FROM ` + tblName + ` WHERE Years.vhpYear = ?`,
        readNextDateRow: `SELECT vhpYear, vhpDate, acceptRegistrations FROM ` + tblName + ` WHERE vhpYear=(SELECT MAX(vhpYear) FROM ` + tblName + `)`
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
                [newEntity.vhpYear, newEntity.vhpDate, acceptRegistrations]
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
                    [race.frontendId, race.name]
                );
            });
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

    async findNext(competition) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbNextDate = await con.query(getYearsQueries(competition).readNextDateRow);
            let entity = this.build(dbNextDate[0]);
            await con.query("COMMIT");

            if (!dbNextDate) {
                return {
                    "suggestedStatus": 404,
                    "error": {
                        "message": "Next date not found."
                    }
                }
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

    async findLast(competition) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRowYear = await con.query(getYearsQueries(competition).readLastYearRow);
            let entity = this.build(dbRowYear[0]);
            // //const tblCategoriesName = competition + `Categories` + entity.vhpYear;
            // const tblCategoriesName = "vhpCategories2020";
            // const checkCategoriesTableQuery = "SHOW TABLES LIKE `" + tblCategoriesName + "`";
            // if (con.query(checkCategoriesTableQuery).length > 0) {
            //     let dbRowsCategories = await con.query(getCategoriesQueries(competition, 2020).readAllRows);
            // }
            // const tblRacesName = competition + `Races` + entity.vhpYear;
            // const checkRacesTableQuery = "SHOW TABLES LIKE `" + tblRacesName + "`";
            // console.log('/-----> con.query(checkRacesTableQuery) : ', con.query(checkRacesTableQuery));
            // console.log('/-----> con.query(checkRacesTableQuery.length) : ', con.query(checkRacesTableQuery).length);
            // if (con.query(checkRacesTableQuery).length > 0) {
            //     let dbRowsRaces = await con.query(getRacesQueries(competition, entity.vhpYear).readAllRows);
            // }
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

            // if (typeof dbRowsRaces !== 'undefined') {
            //     const races = [];
            //     dbRowsRaces.map(row => {
            //         races.push(this.buildRace(row));
            //     });
            //     if (races.length > 0) entity.setRaces(races);
            // }

            return entity;
        } catch (ex) {
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
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
