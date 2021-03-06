'use strict';

const dbConnection = require('../mysqlDbConnection');
const { NewsItemBuilder } = require('./news');

function getQueries(competitionPrefix, count) {
    const tblName = competitionPrefix + `News`;
    return {
        insertRow: `INSERT INTO ` + tblName + `(id, title, content, author) VALUES(?,?,?,?)`,
        readAllRows: `SELECT * FROM ` + tblName + ` ORDER BY timestamp DESC`,
        readCountRows: `SELECT * FROM ` + tblName + ` ORDER BY timestamp DESC LIMIT ` + count,
        readRow: `SELECT * FROM ` + tblName + ` WHERE id = ?`,
        updateRow: `UPDATE ` + tblName + ` SET title = ?, content = ?, author = ? WHERE id = ?`,
        deleteRow: `DELETE FROM ` + tblName + ` WHERE id = ?`
    }
}

let builder = new NewsItemBuilder();

let newsCache = [];
module.exports = class NewsDao {

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
                [newEntity.id, newEntity.title, newEntity.content, newEntity.author]
            );
            await con.query("COMMIT");
            const newCache = await this.find(competition, 10, true);
            newsCache = newCache;
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

    async find(competition, count, updateFromDb) {

        const cache = newsCache;

        if (Array.isArray(cache) && cache.length > 0 && !updateFromDb) {
            return cache;
        } else {
            let con = await dbConnection();
            try {
                await con.query("START TRANSACTION");
                let dbRows;
                if (count !== undefined && count>0) {
                    dbRows = await con.query(getQueries(competition, count).readCountRows);
                } else {
                    dbRows = await con.query(getQueries(competition, 0).readAllRows);
                }
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
                        .setDate(row.timestamp)
                        .build();
                });
                newsCache = entities;
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

    async findById(competition, requestedId) {

        const cache = newsCache;

        if (Array.isArray(cache) && cache.length > 0) {
            return cache.find(x => x.id === requestedId);
        } else {
            let con = await dbConnection();
            try {
                await con.query("START TRANSACTION");
                let dbRow = (await con.query(getQueries(competition, 0).readRow, [requestedId]))[0];
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
                    .setDate(dbRow.timestamp)
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
    }

    //TODO update cache
    async update(competition, entity) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(getQueries(competition, 0).updateRow, [
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

    //TODO update cache
    async remove(competition, id) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(getQueries(competition, 0).deleteRow, [id]);
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
