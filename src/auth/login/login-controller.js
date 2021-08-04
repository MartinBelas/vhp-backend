'use strict';

const jwt = require('jsonwebtoken');
const hash = require('../../common/hash.js');
const LoginDao = require('./login-dao-mysql');
const { LoginBuilder } = require('./login');
const AdminController = require('../admin/admin-controller.js');
const ApiKeyService = require('../../common/ApiKeyService');
const EmailService = require('../../common/EmailService');
const { ResultBuilder } = require('../../common/result');
const DateService = require('../../common/DateService.js');

const dao = new LoginDao();

module.exports = class LoginController {

    static login = async function (req, res) {

        if (ApiKeyService.getApiKeyOk()) {

            // Validate request
            try {
                if (!req.body.login) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }
            } catch (err) {
                console.log('ERR LoginController login, validate request: ', err.message);
                res.status(500);
                return res.send(err.message);
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
                            
                            result.data = userInfo;
                            res.json(result);
                        } else {
                            res.status(401).end();
                        }
                    } 
                })
                .catch(err => {
                    console.error('ERR LoginController login: ', err);
                    res.send(err);
                })
        }

    };

    static logout = async function (req, res) {
        //TODO
        console.log('LOGOUT');
        res.send('logout ok');
    }

    static newPasswordRequest = async function (req, res) {

        if (ApiKeyService.getApiKeyOk()) {

            // Validate request
            try {
                if (!req.body.newpassword) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }
            } catch (err) {
                console.log('ERR LoginController newPassword, validate request: ', err.message);
                res.status(500);
                return res.send(err.message);
            }

            if ((!req.body.newpassword.email) || (!req.body.newpassword.password)) {
                res.status(400).send({ message: "Email and password can not be empty!" });
                return;
            }
            
            let competition = req.body.newpassword.competition;
            let email = req.body.newpassword.email;
            let newPassword = req.body.newpassword.password;
    
            let result;

            // find the user/email in the db
            result = await dao.findOne(competition, email);

            if (!result.isOk) {
                res.status(404).end();
                return;
            } 

            // create hash from newPassword
            const newPasswordHash = hash.hashSync(newPassword);

            // create hash for confirmation
            const confirmationLink = 
                hash.hashSync(email.substring(5)+newPassword.substring(5)+Date.now())
                .substring(30,50)
                .replace("/", "a").replace("\\", "e").replace(".", "e");

            // change the password in db
            result = await dao.updatePasswordRequest(email, newPasswordHash, confirmationLink);
            if (!result.isOk) {
                res.status(400).end();
                return;
            } 

            // send email (with confirmation link)
            sendNewPasswordEmail(email, confirmationLink)
                .then( () => {
                    result = new ResultBuilder()
                        .setIsOk(true)
                        .build();
                    res.status(200).send(result);
                }).catch(err => { 
                    console.log('ERR LoginController newPassword, send confirmation email: ', err);
                    result = new ResultBuilder()
                        .setIsOk(false)
                        .setSuggestedStatus(500)
                        .setErrMessage('Cannot send confirmation email.')
                        .build();
                    res.status(result.status).send(result.errMessage);
                });
            
        }
    };

    static newPasswordConfirmation = async function (req, res) {

        if (ApiKeyService.getApiKeyOk()) {

            // Validate request
            try {
                if (!req.params.confirmation) {
                    res.status(400).send({ message: "Param can not be empty!" });
                    return;
                }
            } catch (err) {
                console.log('ERR LoginController newPasswordConfirmation, validate request: ', err.message);
                res.status(500);
                return res.send(err.message);
            }
            
            let newPasswordConfirmationHash = req.params.confirmation;
            
            let result;

            // find the user/email in the db
            result = await dao.findPasswordConfirmation(newPasswordConfirmationHash)
                            .catch(err => { 
                                console.log('ERR LoginController findPasswordConfirmation: ', err);
                                result = new ResultBuilder()
                                    .setIsOk(false)
                                    .setSuggestedStatus(500)
                                    .setErrMessage('Cannot find confirmation.')
                                    .build();
                                res.status(result.status).send(result.errMessage);
                            });

            if (!result.isOk) {
                res.status(404).end();
                return;
            } 

            // check the timestamp
            const confirmationTimestamp = result.data;
            result = DateService.isValid(confirmationTimestamp, 24 * 60 * 60);
            
            if (!result) {
                res.status(410).end();
                return;
            }

            // update the password in the db
            result = await dao.updatePasswordConfirmation(newPasswordConfirmationHash)
                            .catch(err => { 
                                console.log('ERR LoginController updatePasswordConfirmation: ', err);
                                result = new ResultBuilder()
                                    .setIsOk(false)
                                    .setSuggestedStatus(500)
                                    .setErrMessage('Cannot update.')
                                    .build();
                                res.status(result.status).send(result.errMessage);
                            });

            if (!result.isOk) {
                res.status(404).end();
                return;
            } 

            if (result) {
                result = new ResultBuilder()
                    .setIsOk(true)
                    .build();
                res.status(200).send(result);
            } else {
                result = new ResultBuilder()
                    .setIsOk(false)
                    .setSuggestedStatus(400)
                    .setErrMessage('Cannot confirm.')
                    .build();
            res.status(result.status).send(result.errMessage);
            }
        }
    };

    static responseWithDbConnectionError = function (res) {
        res.status(503);
        res.send({
            "message":"Error when connecting to db."
        });
    };
}

async function sendNewPasswordEmail (email, confirmationLink) {

    const text =  `
    Byl proveden pokus o změnu hesla do administrace webu VH pulmaratonu.
    
    Pokud o tom nic nevíš, tento e-mail smaž.

    Pokud chceš dokončit proces změny hesla, musíš to potvrdit kliknutím na následující odkaz: 
    https://www.vh-pulmaraton.cz/nove-heslo/${confirmationLink}

    Platnost odkazu je 24 hodin.

    `;

    EmailService.sendMail(email, "Zmena hesla pro VH pulmaraton", text);
};
