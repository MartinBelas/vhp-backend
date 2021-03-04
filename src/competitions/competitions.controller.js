'use strict';

const Competition = require("./competition.model.js");

exports.getAll = function(req, res) {
  console.log('Ctrl GET Competitions');
  Competition.find()
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
    console.log('Ctrl GET Competition id: ', req.params.id);
    Competition.findById(req.params.id)
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
    console.log('Ctrl POST Competition');
    
    // Validate request
    if (!req.body.title) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
  
    let new_competition = new Competition(req.body);
    Competition.create(req.body)
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
//     Competition.findOneAndUpdate({_id: req.params.competitionId}, req.body, {new: true}, function(err, competition) {
//       if (err)
//         res.send(err);
//       res.json(competition);
//     });
// };
  
exports.delete = function(req, res) {
    Competition.remove({
      _id: req.params.competitionId
    }, function(err, competition) {
      if (err)
        res.send(err);
      res.json({ message: 'competition successfully deleted' });
    });
};
  