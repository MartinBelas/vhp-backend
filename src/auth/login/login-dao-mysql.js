'use strict';

const dbConnection = require('../../mysqlDbConnection');
const { LoginBuilder } = require('./login');
const { ResultBuilder } = require('../../common/result');

const queries = {
    readRow: `SELECT * FROM Admin WHERE competition = ? AND email = ?`,
}

let builder = new LoginBuilder();
let resultBuilder = new ResultBuilder();

module.exports = class LoginDao {

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

    async findOne(competition, email) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRow = (await con.query(queries.readRow, [competition, email]))[0];
            await con.query("COMMIT");

            if (!dbRow) {
                return resultBuilder
                        .setIsOk(false)
                        .setErrMessage('Record not found.')
                        .setSuggestedStatus(404)
                        .build();
            }

            let entity = builder
                    .setCompetition(dbRow.competition)
                    .setEmail(dbRow.email)
                    .setPassword(dbRow.password)
                    .build();
            return resultBuilder
                        .setIsOk(true)
                        .setData(entity)
                        .build();
        } catch (ex) {
            console.log(ex);
            throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }
};
