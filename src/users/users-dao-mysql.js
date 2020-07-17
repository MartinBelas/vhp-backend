'use strict';

const dbConnection = require('../mysqlDbConnection');
const { User, UserBuilder, Gender } = require('./user');

const queries = {
    insertRow: `INSERT INTO User(id, firstname, lastname, gender) VALUES(?,?,?,?)`,
    readAllRows: `SELECT * FROM User`,
    readRow: `SELECT * FROM User WHERE User.id = ?`,
    updateRow: `UPDATE User SET User.firstname = ?, User.lastname = ? WHERE User.id = ?`,
    deleteRow: `DELETE FROM User WHERE User.id = ?`
}

module.exports = class UsersDao {
  
  async create(newEntity) {
    let con = await dbConnection();
    try {
      await con.query("START TRANSACTION");
      let saved = await con.query(
        queries.insertRow,
        [newEntity.id, newEntity.firstName, newEntity.lastName, newEntity.gender.code]
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
      
      let result = dbRows.map(row => {
        console.log('------------ READ USER row FROM DB: ', row)
        new UserBuilder()
          .setId(row.id)
          .setFirstName(row.firstname)
          .setLastName(row.lasttname)
          // .setBirthDate(row.birthDate)
          .setGender(row.gender)
          // .setEmail(row.email)
          .build();
      }); 


      //entities = JSON.parse(JSON.stringify(entities));
      return result;
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

//module.exports = UsersDao;
