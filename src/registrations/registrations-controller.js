'use strict';

const RegistrationsDao = require('./registrations-dao-mysql');
const { RegistrationBuilder, Sex } = require('./registration');
const YearsDao = require('../years/years-dao-mysql');

const yearsDao = new YearsDao();

module.exports = class RegistrationsController {

    static getAll = function (req, res) {
        console.log('Ctrl GET All Registrations'); //TODO rm
        dao.find()
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                RegistrationsController.responseWithDbConnectionError(res);
            })
    };

    static get = function (req, res) {
        dao.findById(req.params.id)
            .then(result => {
                if (result.error) {
                    if (result.suggestedStatus) {
                        res.status(result.suggestedStatus);
                    }
                    res.json(result.error);
                } else {
                    res.status(200).json(result);
                }
            })
            .catch(err => {
                console.error(err);
                RegistrationsController.responseWithDbConnectionError(res);
            })
    };

    static create = async function (req, res) {

        const competition = req.params.competition;
        const nextYear = (await yearsDao.findNextYear(competition))

        if (nextYear.error) {
            res.status(nextYear.suggestedStatus).send({ message: nextYear.error });
            return;
        }
        
        const nextYearDateYear = nextYear.date.substring(0,4);
        
        const dao =  new RegistrationsDao(nextYearDateYear);

        // Validate request
        if (!req.body.email) {
            res.status(400).send({ message: "Email can not be empty!" });
            return;
        }
        if (!req.body.firstname) {
            res.status(400).send({ message: "First name can not be empty!" });
            return;
        }
        if (!req.body.lastname) {
            res.status(400).send({ message: "Last name can not be empty!" });
            return;
        }
        if (!req.body.birth) {
            res.status(400).send({ message: "Birth year can not be empty!" });
            return;
        }
        if (!req.body.sex) {
            res.status(400).send({ message: "Sex can not be empty!" });
            return;
        }
        let sex = req.body.sex;
        if (!(['M', 'F'].includes(sex))) {
            res.status(400).send({ message: "Sex must be 'M' or 'F' only!" });
            return;
        }
        sex = Sex[sex];

        if (!req.body.race) {
            res.status(400).send({ message: "Race can not be empty!" });
            return;
        }

        let newRegistration = new RegistrationBuilder()
            .setEmail(req.body.email)    
            .setFirstName(req.body.firstname)
            .setLastName(req.body.lastname)
            .setBirth(req.body.birth)
            .setSex(sex)
            .setAddress(req.body.home)
            .setPhone(req.body.phone)
            .setClub(req.body.club)
            .setRace(req.body.race)
            .setComment(req.body.notes)
            .setPaid(false)
            
            //TODO category, timeStamp
            .build();

        console.log("NEW REG newRegistration: ", newRegistration); //TODO rm

        dao.create(req.params.competition, newRegistration)
            .then(data => {
                console.log("NEW REG result: ", data); //TODO rm
                res.json(data);
            })
            .catch(err => {
                console.error("Create registration error: ", err);
                res.send(err);
            })
    };

    static update = async function (req, res) {
        if (!req.params.id) {
            res.status(400).send({ message: "Id can not be empty!" });
            return;
        }
        let user = await dao.findById(req.params.id);
        if (req.body.lastname) { user.updateLastName(req.body.lastname) };
        if (req.body.email) { user.updateLastName(req.body.email) };
        dao.update(user)
            .then(data => {
                console.log(data);
                data = JSON.parse(JSON.stringify(data));
            })
            .catch(err => {
                console.error(err);
                res.send(err);
            });
    };

    static delete = function (req, res) {
        if (!req.params.id) {
            res.status(400).send({ message: "Id can not be empty!" });
            return;
        }
        dao.remove(req.params.id)
            .then(data => {
                console.log(data);
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                res.send(err);
            });
    };

    static responseWithDbConnectionError = function (res) {
        res.status(503);
        res.send({
            "message":"Error when connecting to db."
        });
    };
}