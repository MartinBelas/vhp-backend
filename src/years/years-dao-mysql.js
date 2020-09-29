'use strict';

const dbConnection = require('../mysqlDbConnection');
const { YearBuilder } = require('./year');

function getQueries(competitionPrefix) {
    return {
        insertRow: `INSERT INTO ` + competitionPrefix + `Years(vhpYear, vhpDate, acceptRegistrations) VALUES(?,?,?)`,
        readAllRows: `SELECT vhpYear, DATE_FORMAT(vhpDate, '%Y-%m-%d') as vhpDate, acceptRegistrations FROM ` + competitionPrefix + `Years`,
        readLastYearRow: `SELECT vhpYear, DATE_FORMAT(vhpDate, '%Y-%m-%d') as vhpDate, acceptRegistrations FROM ` + competitionPrefix + `Years WHERE vhpYear=(SELECT MAX(vhpYear) FROM ` + competitionPrefix + `Years)`,
        readRow: `SELECT * FROM Years WHERE Years.vhpYear = ?`,
        updateRow: `UPDATE Years SET Years.vhpDate = ?, Years.acceptRegistrations WHERE Years.vhpYear = ?`,
        deleteRow: `DELETE FROM Years WHERE Years.vhpYear = ?` //TODO disable delete
    }
}

let builder = new YearBuilder();

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
            await con.query(
                getQueries(competition).insertRow,
                [newEntity.vhpYear, newEntity.vhpDate, false]
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
            let dbRows = await con.query(getQueries(competition).readAllRows);
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

    async findLast(competition) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRow = await con.query(getQueries(competition).readLastYearRow);
            await con.query("COMMIT");

            if (!dbRow) {
                return {
                    "suggestedStatus": 404,
                    "error": {
                        "message": "Last year not found."
                    }
                }
            }
            let entity = this.build(dbRow[0]);
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
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(queries.updateRow, [
                entity.vhpDate,
                entity.vhpYear
            ]);
            await con.query("COMMIT");
            return entity;
        } catch (ex) {
            await con.query("ROLLBACK");
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    // async remove(id) {
    //     let con = await dbConnection();
    //     try {
    //         await con.query("START TRANSACTION");
    //         await con.query(queries.deleteRow, [id]);
    //         await con.query("COMMIT");
    //         return true;
    //     } catch (ex) {
    //         await con.query("ROLLBACK");
    //         console.log(ex);
    //         throw ex;
    //     } finally {
    //         await con.release();
    //         await con.destroy();
    //     }
    // }

    build(row) {
        return builder
            .setVhpYear(row.vhpYear)
            .setVhpDate(row.vhpDate)
            .setAcceptRegistrations(row.acceptRegistrations)
            .build();
    }
};
