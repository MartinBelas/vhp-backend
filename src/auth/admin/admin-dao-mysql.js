'use strict';

const dbConnection = require('../../mysqlDbConnection');
const { AdminBuilder } = require('./admin');

const queries = {
    insertRow: `INSERT INTO Admin(email, password) VALUES(?,?)`,
    readRow: `SELECT * FROM Admin WHERE email = ? AND password = ?`,
}

let builder = new AdminBuilder();

module.exports = class AdminsDao {

    async getDbConnection() {
        if (!this.dbConnectionConfig) {
            throw new Error('dbConnectionConfig is missing.');
        }
        let con = await this.dbConnectionConfig();
        return con;
    }

    async create(newEntity) {
        //TODO let duplicityCheck = (await findOne(newEntity))....
        //if (!duplicityCheck) throw new Error("Duplicity check error.");

        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(
                queries.insertRow,
                [newEntity.email, newEntity.password]
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

    async findOne(entity) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRow = (await con.query(queries.readRow, [entity.email, entity.password]))[0];
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
