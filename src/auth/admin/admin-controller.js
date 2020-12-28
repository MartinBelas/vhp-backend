'use strict';

const jwt = require('jsonwebtoken');
const hash = require('../../common/hash.js');
const AdminDao = require('./admin-dao-mysql');
const { AdminBuilder } = require('./admin');

const dao = new AdminDao();

module.exports = class AdminController {

    static create = async function (req, res) {

        console.log('AdminController, create... ');
        
        AdminController.authenticate(req, res)
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

                dao.create(newAdmin)
                    .then(data => {
                        console.log("New Admin created.");
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
    };

    static authenticate = function(req, res) {
        
        return new Promise((resolve, reject) => {
        
            if (typeof req.headers.authorization === "undefined") {
                reject(401);
            } else {

                let token = req.headers.authorization.split(" ")[1];
                jwt.verify(token, "secret", (err) => {
                    if (err) {
                        reject(403);
                    }
                });

                if ((req.body === undefined) || (req.body.secret === undefined) || (req.body.secret !== process.env.SUPERADMIN_SECRET)) {
                    reject(400);
                }
            }

            resolve(200);
        });
    }
}