'use strict';

const jwt = require('jsonwebtoken');
const hash = require('../../common/hash.js');
const AdminDao = require('./admin-dao-mysql');
const { AdminBuilder } = require('./admin');
const ApiKeyService = require('../../common/ApiKeyService');

const dao = new AdminDao();

module.exports = class AdminController {

    static users = new Map();

    static create = async function (req, res) {

        console.log('AdminController, create... ');

        if (ApiKeyService.getApiKeyOk()) {
            AdminController.authenticateNewAdminCreation(req, res)
                .then( authenticationResult => {
    
                    if (authenticationResult >= 400) {
                        res.status(authenticationResult).end();
                        throw new Error("Not Authorized");
                    }
    
                    // Validate request
                    if (!req.body.admin) {
                        res.status(400).send({ message: "Content can not be empty!" });
                        return;
                    }
                    if (!req.body.admin.competition) {
                        res.status(400).send({ message: "Competition can not be empty!" });
                        return;
                    }
                    if (!req.body.admin.email) {
                        res.status(400).send({ message: "User/email can not be empty!" });
                        return;
                    }
                    if (!req.body.admin.password) {
                        res.status(400).send({ message: "Password can not be empty!" });
                        return;
                    }
    
                    const hashPassword = hash.hashSync(req.body.admin.password);
    
                    const newAdmin = new AdminBuilder()
                        .setCompetition(req.body.admin.competition)
                        .setEmail(req.body.admin.email)
                        .setPassword(hashPassword)
                        .build();
    
                    //TODO use only when new admin creation 
                    dao.create(newAdmin)
                        .then(data => {
                            console.log("New Admin created.");
                            data.password = "";
                            res.json(data);
                        })
                        .catch(err => {
                            if (err.errno == 1062) {
                                res.status(409);
                            } else {
                                res.status(400);
                            }
                            res.send(err.code);
                        })
                }).catch( authenticationFailure => {
                    res.status(authenticationFailure).end();
                })
        }
        
    };

    static authenticate = function(req, res) {

        if (ApiKeyService.getApiKeyOk()) {
            return new Promise((resolve, reject) => {
    
                if (typeof req.headers.authorization === "undefined") {
                    reject(401);
                } 
    
                let token = req.headers.authorization;
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
                    if (err) {
                        reject(403);
                    } else {
                        const result = {
                            "isOk": true,
                            "status": 200,
                            "user": data.id
                        }
                        resolve(result);
                    }
                });
            });
        }

    }

    static authenticateNewAdminCreation = function(req, res) {

        if (ApiKeyService.getApiKeyOk()) {
            return new Promise((resolve, reject) => {
    
                //TODO for new admin creation only
                if ((req.body === undefined) || (req.body.secret === undefined) || (req.body.secret !== process.env.SUPERADMIN_SECRET)) {
                    reject(400);
                } else if (typeof req.headers.authorization === "undefined") {
                    reject(401);
                } else {
                    // let token = req.headers.authorization;
                    // jwt.verify(token, process.env.SUPERADMIN_SECRET, (err, data) => {
                    //     if (err) {
                    //         console.log('AdminController, create... 403');
                    //         console.log('err: ', err);
                    //         reject(403);
                    //     } else {
                            const result = {
                                // "user": data.id,
                                "isOk": true,
                                "status": 200
                            }
                            resolve(result);
                        // }
                    // });
                }
            });
        }

    }
}