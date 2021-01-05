'use strict';

const jwt = require('jsonwebtoken');
const hash = require('../../common/hash.js');
const LoginDao = require('./login-dao-mysql');
const { LoginBuilder } = require('./login');
const AdminController = require('../admin/admin-controller.js');

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
                        let userInfo = result.data;
                        userInfo.password = "";

                        //create the access token with the shorter lifespan
                        let accessToken = jwt.sign(
                            {id: userInfo.email}, 
                            process.env.ACCESS_TOKEN_SECRET, 
                            {
                                algorithm: "HS256",
                                expiresIn: process.env.ACCESS_TOKEN_LIFE
                            }
                        )

                        userInfo.accessToken = accessToken;

                        // store the  token in the user array //TODO - do I need it?
                        AdminController.users[userInfo.email] = accessToken;
                        console.log('Logged ADMINS: ', AdminController.users);
                        
                        result.data = userInfo;
                        res.json(result);
                    } else {
                        res.status(401).end();
                    }
                } 
            })
            .catch(err => {
                console.error('ERR.: ', err);
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