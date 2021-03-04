'use strict';

const dbConnection = require('../../mysqlDbConnection');
const { LoginBuilder } = require('./login');
const { ResultBuilder } = require('../../common/result');
const DateService = require('../../common/DateService');

const queries = {
    readRow: `SELECT * FROM Admin WHERE competition = ? AND email = ?`,
    readRowPasswordConfirmation: `SELECT newpassword_timespamp FROM Admin WHERE confirmation_link LIKE ?`,
    requestUpdatePassword: `UPDATE Admin SET new_password = ?, confirmation_link = ?, newpassword_timespamp = ? WHERE email = ?`,
    confirmUpdatePassword: `UPDATE Admin SET password = new_password, newpassword_timespamp = 0, confirmation_link = "" WHERE confirmation_link LIKE ?`
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
                        .setSuggestedStatus(404)
                        .setErrMessage('Record not found.')
                        .build();
            }

            let entity = builder
                    .setCompetition(dbRow.competition)
                    .setEmail(dbRow.email)
                    .setPassword(dbRow.password)
                    .build();
                    
            return resultBuilder
                        .setIsOk(true)
                        .setSuggestedStatus(200)
                        .setData(entity)
                        .build();
        } catch (err) {
            console.log('ERR Login dao findOne: ', err);
            //throw err;
            return resultBuilder
                        .setIsOk(false)
                        .setSuggestedStatus(500)
                        .setErrMessage(err)
                        .build();
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async findPasswordConfirmation(newPasswordConfirmationHash) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRow = (await con.query(queries.readRowPasswordConfirmation, [newPasswordConfirmationHash]))[0];
            await con.query("COMMIT");

            if (!dbRow) {
                return resultBuilder
                        .setIsOk(false)
                        .setSuggestedStatus(404)
                        .setErrMessage('Record not found.')
                        .build();
            }
            
            return resultBuilder
                        .setIsOk(true)
                        .setSuggestedStatus(200)
                        .setData(dbRow.newpassword_timespamp)
                        .setErrMessage('')
                        .build();
        } catch (err) {
            console.log('ERR Login dao find confirmation: ', err);
            //throw err;
            return resultBuilder
                        .setIsOk(false)
                        .setSuggestedStatus(500)
                        .setErrMessage(err)
                        .build();
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async updatePasswordRequest(email, newPasswordHash, confirmationLink) {
        let con = await dbConnection();
        try {
            const timeStamp = DateService.getTimestamp();
            await con.query("START TRANSACTION");
            await con.query(queries.requestUpdatePassword, [
                newPasswordHash, confirmationLink, timeStamp, email
            ]);
            await con.query("COMMIT");
            return resultBuilder
                    .setIsOk(true)
                    .setSuggestedStatus(200)
                    .build();
        } catch (ex) {
            await con.query("ROLLBACK");
            console.log(ex);
            return resultBuilder
                    .setIsOk(false)
                    .setSuggestedStatus(500)
                    .setErrMessage('Update error occurred.')
                    .build();
            //throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async updatePasswordConfirmation(newPasswordConfirmationHash) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            const dbRes = (await con.query(queries.confirmUpdatePassword, [newPasswordConfirmationHash]))[0];
            await con.query("COMMIT");
            return resultBuilder
                    .setIsOk(true)
                    .setSuggestedStatus(200)
                    .setErrMessage('')
                    .build();
        } catch (ex) {
            await con.query("ROLLBACK");
            console.log(ex);
            return resultBuilder
                    .setIsOk(false)
                    .setSuggestedStatus(500)
                    .setErrMessage('Confirmation error occurred.')
                    .build();
            //throw ex;
        } finally {
            await con.release();
            await con.destroy();
        }
    }
};
