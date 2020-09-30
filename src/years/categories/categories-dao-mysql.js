'use strict';

const dbConnection = require('../../mysqlDbConnection');
const {CategoryBuilder } = require('./category');

function getQueries(competitionPrefix, year) {
    return {
        insertRow: `INSERT INTO ` + competitionPrefix + `Categories(id, description) VALUES(?,?)`,
        readAllRows: `SELECT * FROM ` + competitionPrefix + `Categories` + year,
        readRow: `SELECT * FROM ` + competitionPrefix + `Categories` + year + ` WHERE id = ?`,
        updateRow: `UPDATE ` + competitionPrefix + `Categories` + year + ` SET description = ? WHERE id = ?`,
        deleteRow: `DELETE FROM ` + competitionPrefix + `Categories` + year + ` WHERE id = ?`
    }
}

let builder = new CategoryBuilder();

module.exports = class CategoriesDao {

    constructor(year) {
        this.year = year;
    }

    async getDbConnection() {
        if (!this.dbConnectionConfig) {
            throw new Error('dbConnectionConfig is missing.');
        }
        let con = await this.dbConnectionConfig();
        return con;
    }

    async create(newEntity) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(
                queries.insertRow,
                [newEntity.vhpYear, newEntity.vhpDate]
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
            //const tblCategoriesName = competition + `Categories` + entity.vhpYear;
            const tblCategoriesName = "vhpCategories2020";
            const checkCategoriesTableQuery = "SHOW TABLES LIKE '" + tblCategoriesName + "'";
            let dbRows;
            const categoriesTableExists = (await con.query(checkCategoriesTableQuery)).length;
            if (categoriesTableExists) {
                dbRows = await con.query(getQueries(competition, this.year).readAllRows);
            }
            await con.query("COMMIT");

            if (!dbRows) {
                return [];
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

    build(row) {
        return builder
            .setId(row.id)
            .setDescription(row.description)
            .build();
    }
};
