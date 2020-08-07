'use strict';

const bcrypt = require('bcrypt');
const AdminDao = require('./admin-dao-mysql');
const { AdminBuilder } = require('./admin');

// import { hash as _hash } from 'bcrypt';
// import AdminDao from './admin-dao-mysql';
// import { AdminBuilder } from './admin';

const dao = new AdminDao();

module.exports = class AdminController {

    static create = async function (req, res) {

        console.log('AdminController, create... ');

        if (!(req.body) || (!req.body.secret) && (req.body.secret !== process.env.SUPERADMIN_SECRET)) {
            res.status(400).end();
            return;
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

        const saltRounds = 10;
        const hashPassword = bcrypt.hashSync(req.body.admin.password, saltRounds);

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
                console.error(err);
                res.send(err);
            })
    };

    static responseWithDbConnectionError = function (res) {
        res.status(503);
        res.send({
            "message":"Error when connecting to db."
        });
    };
}