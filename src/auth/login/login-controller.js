'use strict';

const hash = require('../../common/hash.js');
const LoginDao = require('./login-dao-mysql');
const { LoginBuilder } = require('./login');

const dao = new LoginDao();

module.exports = class LoginController {

    static login = async function (req, res) {

        // Validate request
        if (!req.body.login) {
            res.status(400).send({ message: "Content can not be empty!" });
            return;
        }
        if (!req.body.login.competition) {
            res.status(400).send({ message: "Competition can not be empty!" });
            return;
        }
        if ((!req.body.login.email) || (!req.body.login.password)) {
            res.status(400).send({ message: "User/email and password can not be empty!" });
            return;
        }
        
        let newLoginAttempt = new LoginBuilder()
            .setCompetition(req.body.login.competition)
            .setEmail(req.body.login.email)
            .setPassword(req.body.login.password)
            .build();

        dao.findOne(newLoginAttempt.competition, newLoginAttempt.email)
            .then(result => {
                if (!result.isOk) {
                    res.status(401).end();
                } else {
                    const loginOk = hash.compareSync(newLoginAttempt.password, result.data.password);
                    if (loginOk) {
                        result.data.password = "";
                        res.json(result.data);
                        //TODO set Context in frontend
                    } else {
                        res.status(401).end();
                    }
                } 
            })
            .catch(err => {
                console.error('ERR.:', err);
                res.send(err);
            })
    };

    static logout = async function (req, res) {
        //TODO
        console.log('LOGOUT');
        res.send('logout ok');
    }

    static responseWithDbConnectionError = function (res) {
        res.status(503);
        res.send({
            "message":"Error when connecting to db."
        });
    };
}