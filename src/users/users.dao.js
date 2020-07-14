'use strict';

const dbConnection = require('../mysqlDbConnection');
//const dbConnection = require('../postgresqlDbConnection');

const queries = {
    insert_user: `INSERT INTO User(name, surname, birthDate, sex) VALUES(?,?,?,?)`,
    read_users: `SELECT * FROM User`,
    read_user: `SELECT * FROM User WHERE User.id = ?`,
    update_user: `UPDATE User SET User.name = ?, User.surname = ? WHERE User.id = ?`,
    delete_user: `DELETE FROM User WHERE User.id = ?`
}

module.exports = class UsersDao {
  
  async create(newEntity) {
    let con = await dbConnection();
    try {
      await con.query("START TRANSACTION");
      let saved = await con.query(
        queries.insert_user,
        [newEntity.email, newEntity.name, newEntity.surname, newEntity.birhtDate, newEntity.sex]
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
      let entities = await con.query(queries.read_users);
      await con.query("COMMIT");
      entities = JSON.parse(JSON.stringify(entities));
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
      let entity = await con.query(queries.read_user, [id]);
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
      await con.query(queries.update_user, [
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
      await con.query(queries.delete_user, [id]);
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
