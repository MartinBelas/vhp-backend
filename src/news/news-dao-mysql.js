'use strict';

const dbConnection = require('../mysqlDbConnection');
const { NewsItemBuilder } = require('./news');

// var competitionPrefix;

function getQueries(competitionPrefix) {
    return {
        insertRow: `INSERT INTO ` + competitionPrefix + `News(id, title, content, author) VALUES(?,?,?,?)`,
        readAllRows: `SELECT * FROM ` + competitionPrefix + `News`,
        readRow: `SELECT * FROM News WHERE News.id = ?`,
        updateRow: `UPDATE News SET News.title = ?, News.content = ?, News.author = ? WHERE News.id = ?`,
        deleteRow: `DELETE FROM News WHERE News.id = ?`
    }
}

let builder = new NewsItemBuilder();

module.exports = class NewssDao {

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
                [newEntity.id, newEntity.title, newEntity.content, newEntity.author]
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
                return builder
                    .setIdFromDb(row.id)
                    .setTitle(row.title)
                    .setContent(row.content)
                    .setAuthor(row.author)
                    .build();
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

    async findById(id) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRow = (await con.query(queries.readRow, [id]))[0];
            await con.query("COMMIT");

            if (!dbRow) {
                return {
                    "suggestedStatus": 404,
                    "error": {
                        "message": "News not found."
                    }
                }
            }
            let entity = builder
                .setIdFromDb(dbRow.id)
                .setTitle(dbRow.title)
                .setContent(dbRow.content)
                .setAuthor(dbRow.author)
                .build();
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
                entity.title,
                entity.content,
                entity.author,
                entity.id
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

    async remove(id) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(queries.deleteRow, [id]);
            await con.query("COMMIT");
            return true;
        } catch (ex) {
            await con.query("ROLLBACK");
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }
};
