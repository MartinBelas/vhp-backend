'use strict';

const bcrypt = require('bcrypt');
const LoginDao = require('./login-dao-mysql');
const LoginBuilder = require('./login');

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
        if (!req.body.login.user) {
            res.status(400).send({ message: "User/email can not be empty!" });
            return;
        }
        if (!req.body.login.password) {
            res.status(400).send({ message: "Password can not be empty!" });
            return;
        }

        const saltRounds = 10;
        const hashPassword = bcrypt.hashSync(req.body.login.password, saltRounds);

        let newLoginAttempt = new LoginBuilder()
            .setCompetition(req.body.login.competition)
            .setUser(req.body.login.user)
            .setPassword(hashPassword)
            .build();

        //TODO
        dao.find(newLoginAttempt)
            .then(data => {
                console.log('Login ok, user: ', data.email);
                res.json(data);
            })
            .catch(err => {
                console.error(err);
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