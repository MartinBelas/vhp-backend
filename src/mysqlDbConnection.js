const mysql = require('promise-mysql');

//TODO move the config to some secure place ??
const dbConfig = {
    host: "192.168.99.100",
    port: 3306,
    database : 'vhp3',
    user: "root",
    password: "rootpassword",
    connectionLimit: 10
}

module.exports = async () => {
    try {
        let pool;
        let con;
        if (pool) con = pool.getConnection();
        else {
            pool = await mysql.createPool(dbConfig);
            con = pool.getConnection();
        }
        return con;
    } catch (ex) {
        throw ex;
    }
}