'use strict';

const dbConnection = require('../mysqlDbConnection');
const { RegistrationBuilder, Sex } = require('./registration');

function getQueries(competitionPrefix, year) {
    const tblName = competitionPrefix + `Runners` + year;
    return {
        insertRow: `INSERT INTO ` + tblName + `(id, email, firstname, lastname, birth, sex, address, phone, club, race, comment, category, create_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        readAllRows: `SELECT * FROM ` + tblName + ` ORDER BY create_time DESC`,
        readRow: `SELECT * FROM ` + tblName + ` WHERE id = ?`,
        updateRow: `UPDATE ` + tblName + ` SET paid = ? WHERE id = ?`,
        //deleteRow: `DELETE FROM ` + tblName + ` WHERE User.id = ?`
    }
}

let builder = new RegistrationBuilder();

let registrationsCache = [];
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
            await this.find(competition, true);
            return newEntity;
        } catch (err) {
            await con.query("ROLLBACK");
            throw err;
        } finally {
            await con.release();
            await con.destroy();
        }
    }

    async find(competition, updateFromDb) {
        
        const cache = registrationsCache;

        if (Array.isArray(cache) && cache.length > 0 && !updateFromDb) {
            return cache;
        } else {
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
                        .setPhone(row.phone)
                        .setAddress(row.address)
                        .setClub(row.club)
                        .setRace(row.race)
                        .setPaid(row.paid == 1 ? true : false)
                        .build();
                });
                registrationsCache = entities;
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
            let dbRow = (await con.query(getQueries(competition, this.year).readRow, [id]))[0];
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
                    .setBirth(dbRow.birth)
                    .setSex(Sex[dbRow.sex])
                    .setEmail(dbRow.email)
                    .setPaid(dbRow.paid)
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

    async update(competition, entity) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(getQueries(competition, this.year).updateRow, [
                entity.paid,
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

    async remove(competition, id) {
        let con = await dbConnection();
        try {
            await con.query("START TRANSACTION");
            await con.query(getQueries(competition, this.year).deleteRow, [id]);
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
