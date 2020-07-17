'use strict';

const UsersDao = require('./users-dao-mysql');

const dao = new UsersDao();

exports.getAll = function(req, res) {
  console.log('Ctrl GET Users');
  dao.find()
    .then(data => {
      console.log(data);
      res.json(data);
    })
    .catch (err => {
      console.error(err);
      res.send(err);
    })
};

exports.get = function(req, res) {
    console.log('Ctrl GET User, req.params: ', req.params);
    console.log('Ctrl GET User id: ', req.params.id);
    dao.findById(req.params.id)
      .then(data => {
        console.log(data);
        res.json(data);
      })
      .catch (err => {
        console.error(err);
        res.send(err);
    })
};

exports.create = function(req, res) {
    console.log('Ctrl POST User');
    console.log("REQ.body: ", req.body);
    
    // Validate request
    if (!req.body.user) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
  
    let newUser = new UserBuilder()
      .firstName(req.body.firstName)
      .lastName(req.body.firstName)
      .build();

      dao.create(newUser)
      .then(data => {
        console.log(data);
        res.json(data);
      })
      .catch (err => {
        console.error(err);
        res.send(err);
    })
 };

// exports.update = function(req, res) {
//     User.findOneAndUpdate({_id: req.params.competitionId}, req.body, {new: true}, function(err, competition) {
//       if (err)
//         res.send(err);
//       res.json(competition);
//     });
// };
  
exports.remove = function(req, res) {
    UsersDao.remove({
      _id: req.params.competitionId
    }, function(err, competition) {
      if (err) {
        res.send(err);
      }
      res.json({ message: "User successfully deleted." });
    });
};
  