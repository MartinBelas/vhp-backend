'use strict';

const UsersDao = require('./users-dao-mysql');
const { UserBuilder, Gender } = require('./user');

const dao = new UsersDao();

exports.getAll = function(req, res) {
  console.log('Ctrl GET All Users');
  dao.find()
    .then(data => {
      console.log(data);
      data = JSON.parse(JSON.stringify(data));
    })
    .catch (err => {
      console.error(err);
      res.send(err);
    })
};

exports.get = function(req, res) {
    dao.findById(req.params.id)
        .then(data => {
            data = JSON.parse(JSON.stringify(data));
            console.log(data);
            res.json(data);
        })
        .catch(err => {
            console.error(err);
            res.send(err);
        })
};

exports.create = async function(req, res) {
    
    // Validate request
    if (!req.body.user) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
    if (!req.body.user.gender) {
        res.status(400).send({ message: "Gender can not be empty!" });
        return;
    }
    let gender = req.body.user.gender;
    if (!(['M', 'F'].includes(gender))) {
        res.status(400).send({ message: "Gender must be 'M' or 'F' only!" });
        return;
    }
    gender = Gender[gender];

    let newUser = new UserBuilder()
        .setFirstName(req.body.user.firstname)
        .setLastName(req.body.user.lastname)
        .setBirthDate(req.body.user.birthdate)
        .setGender(gender)
        .setEmail(req.body.user.email)
        .build();

    dao.create(newUser)
        .then(data => {
            console.log(data);
            res.json(data);
        })
        .catch(err => {
            console.error(err);
            res.send(err);
        })
 };

exports.update = async function(req, res) {
    if (!req.params.id) {
        res.status(400).send({ message: "Id can not be empty!" });
        return;
    }
    let user = await dao.findById(req.params.id);
    if (req.body.lastname) {user.updateLastName(req.body.lastname)};
    if (req.body.email) {user.updateLastName(req.body.email)};
    dao.update(user)
    .then(data => {
        console.log(data);
        data = JSON.parse(JSON.stringify(data));
      })
      .catch (err => {
        console.error(err);
        res.send(err);
    });
};
  
exports.delete = function(req, res) {
    if (!req.params.id) {
        res.status(400).send({ message: "Id can not be empty!" });
        return;
    }
    dao.remove(req.params.id)
    .then(data => {
        console.log(data);
        res.json(data);
      })
      .catch (err => {
        console.error(err);
        res.send(err);
    });
};
  