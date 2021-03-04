'use strict';

const dbConnection = require('../mysqlDbConnection');
const { RegistrationBuilder, Sex } = require('./registration');

function getQueries(competitionPrefix, year) {
    const tblName = competitionPrefix + `Runners` + year;
    return {
        insertRow: `INSERT INTO ` + tblName + `(id, email, firstname, lastname, birth, sex, address, phone, club, race, comment, category, create_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        readAllRows: `SELECT * FROM ` + tblName,
        readRow: `SELECT * FROM ` + tblName + ` WHERE id = ?`,
        //updateRow: `UPDATE ` + tblName + ` SET User.firstname = ?, User.lastname = ?, User.birthdate = ?, User.sex = ?, User.email = ? WHERE User.id = ?`,
        //deleteRow: `DELETE FROM ` + tblName + ` WHERE User.id = ?`
    }
}

let builder = new RegistrationBuilder();

module.exports = class RegistrationsDao {

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

    async create(competition, newEntity) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(
                getQueries(competition, this.year).insertRow,
                [
                    newEntity.id, 
                    newEntity.email, 
                    newEntity.firstName, 
                    newEntity.lastName, 
                    newEntity.birth, 
                    newEntity.sex.code,
                    newEntity.address, 
                    newEntity.phone, 
                    newEntity.club, 
                    newEntity.race,
                    newEntity.comment,
                    "TDO",
                    new Date()
                ]
            );
            await con.query("COMMIT");
            return newEntity;
        } catch (err) {
            await con.query("ROLLBACK");
            throw err;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async find(competition) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            let dbRows = await con.query(getQueries(competition, this.year).readAllRows);
            await con.query("COMMIT");

            if (!dbRows) {
                throw {"message":"No data from db."};    
            }

            let entities = dbRows.map(row => {
                return builder
                    .setIdFromDb(row.id)
                    .setFirstName(row.firstname)
                    .setLastName(row.lastname)
                    .setBirth(row.birth)
                    .setSex(Sex[row.sex])
                    .setEmail(row.email)
                    .setAddress(row.address)
                    .setClub(row.club)
                    .setRace(row.race)
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
                    "suggestedStatus":404,
                    "error":{
                        "message":"User not found."
                    }
                }
            }
            let entity = builder
                    .setIdFromDb(dbRow.id)
                    .setFirstName(dbRow.firstname)
                    .setLastName(dbRow.lastname)
                    .setBirthDate(dbRow.birthdate)
                    .setSex(Sex[dbRow.sex])
                    .setEmail(dbRow.email)
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
                entity.firstName,
                entity.lastName,
                entity.birthDate,
                entity.sex.code,
                entity.email,
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
