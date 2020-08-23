'use strict';

const hash = require('../../common/hash.js');
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
    };

    static responseWithDbConnectionError = function (res) {
        res.status(503);
        res.send({
            "message":"Error when connecting to db."
        });
    };
}