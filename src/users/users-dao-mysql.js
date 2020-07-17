'use strict';

const dbConnection = require('../mysqlDbConnection');
const { UserBuilder, Gender } = require('./user');

const queries = {
    insertRow: `INSERT INTO User(id, firstname, lastname, birthdate, gender, email) VALUES(?,?,?,?,?,?)`,
    readAllRows: `SELECT * FROM User`,
    readRow: `SELECT * FROM User WHERE User.id = ?`,
    updateRow: `UPDATE User SET User.firstname = ?, User.lastname = ? WHERE User.id = ?`,
    deleteRow: `DELETE FROM User WHERE User.id = ?`
}

module.exports = class UsersDao {

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
            let saved = await con.query(
                queries.insertRow,
                [newEntity.id, newEntity.firstName, newEntity.lastName, newEntity.birthDate, newEntity.gender.code, newEntity.email]
            );
            await con.query("COMMIT");
            newEntity.id = saved.insertId;
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

    async find() {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRows = await con.query(queries.readAllRows);
            await con.query("COMMIT");

            dbRows = JSON.parse(JSON.stringify(dbRows));
            let builder = new UserBuilder();
            let entities = dbRows.map(row => {
                return builder
                    .setIdFromDb(row.id)
                    .setFirstName(row.firstname)
                    .setLastName(row.lastname)
                    .setBirthDate(row.birthdate)
                    .setGender(Gender[row.gender])
                    .setEmail(row.email)
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
            let entity = await con.query(queries.readRow, [id]);
            await con.query("COMMIT");
            entity = JSON.parse(JSON.stringify(entity));
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
                entity.completed,
                entity.id
            ]);
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
