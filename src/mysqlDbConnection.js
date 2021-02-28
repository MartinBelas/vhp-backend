'use strict';

const mysql = require('promise-mysql');

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database : process.env.DB_SCHEMA,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 10
}

module.exports = async () => {
    try {
        let pool;
        let con;
        if (pool) con = pool.getConnection();
        else {
            try {
                pool = await mysql.createPool(dbConfig);
                con = pool.getConnection();
            } catch (err) {
                console.log('ERR - Cannot connect to db. ', err);
                throw err;
            }
        }
        return con;
    } catch (ex) {
        throw ex;
    }
}