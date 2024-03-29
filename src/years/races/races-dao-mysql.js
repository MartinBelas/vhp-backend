'use strict';

const dbConnection = require('../../mysqlDbConnection');
const {RaceBuilder } = require('./race');

function getQueries(competitionPrefix, year) {
    return {
        // insertRow: `INSERT INTO ` + competitionPrefix + `Races` + year + `(id, description) VALUES(?,?)`, // inserting only from years controller
        readAllRows: `SELECT * FROM ` + competitionPrefix + `Races` + year,
        readRow: `SELECT * FROM ` + competitionPrefix + `Races` + year + ` WHERE id = ?`,
        updateRow: `UPDATE ` + competitionPrefix + `Races` + year + ` SET description = ? WHERE id = ?`,
        deleteRow: `DELETE FROM ` + competitionPrefix + `Races` + year + ` WHERE id = ?`
    }
}

let builder = new RaceBuilder();

let racesCache = [];
module.exports = class RacesDao {

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

    //TODO rm
    // async create(newEntity) {
    //     let con = await dbConnection();
    //     try {
    //         await con.query("START TRANSACTION");
    //         await con.query(
    //             getQueries(competition, this.year).insertRow,
    //             [newEntity.id, newEntity.description]
    //         );
    //         await con.query("COMMIT");
    //         return newEntity;
    //     } catch (ex) {
    //         await con.query("ROLLBACK");
    //         console.log(ex);
    //         throw ex;
    //     } finally {
    //         await con.release();
    //         await con.destroy();
    //     }
    // }

    async find(competition, updateFromDb) {

        const cache = racesCache;

        if (Array.isArray(cache) && cache.length > 0 && !updateFromDb) {
            return cache;
        } else {
            let con = await dbConnection();
            try {
                await con.query("START TRANSACTION");
                const tblRacesName = competition + `Races` + this.year;
                const checkRacesTableQuery = "SHOW TABLES LIKE '" + tblRacesName + "'";
                let dbRows;
                const racesTableExists = (await con.query(checkRacesTableQuery)).length;
                if (racesTableExists) {
                    dbRows = await con.query(getQueries(competition, this.year).readAllRows);
                }
                await con.query("COMMIT");
    
                if (!dbRows) {
                    return [];
                }
    
                let entities = dbRows.map(row => {
                    return this.build(row);
                });
                racesCache = entities;
                return entities;
            } catch (ex) {
                console.log(ex);
                throw ex;
            } finally {
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
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(queries.updateRow, [
                entity.id,
                entity.description
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
