'use strict';

const dbConnection = require('../../mysqlDbConnection');
const { LoginBuilder } = require('./login');

const queries = {
    readRow: `SELECT * FROM Login WHERE competition = ? AND email = ? AND password = ?`,
}

let builder = new LoginBuilder();

module.exports = class LoginsDao {

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
                [newEntity.competition, newEntity.email, newEntity.password]
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

    async findOne(competition, email, password) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRow = (await con.query(queries.readRow, [competition, email, password]))[0];
            await con.query("COMMIT");

            if (!dbRow) {
                return {
                    "suggestedStatus":404,
                    "error":{
                        "message":"Record not found."
                    }
                }
            }
            let entity = builder
                    .setCompetition(dbRow.competition)
                    .setEmail(dbRow.email)
                    .setPassword(dbRow.password)
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
};
