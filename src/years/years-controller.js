'use strict';

const YearsDao = require('./years-dao-mysql');
const { YearsItemBuilder } = require('./year');

const dao = new YearsDao();

module.exports = class YearsController {

    static getAll = function (req, res) {
        console.log('Ctrl GET All Years'); //TODO remove
        dao.find(req.params.competition)
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                YearsController.responseWithDbConnectionError(res);
            })
    };

    static getLast = function (req, res) {
        console.log('Ctrl GET LAST Year'); //TODO remove
        dao.findLast(req.params.competition)
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
                YearsController.responseWithDbConnectionError(res);
            })
    };

    static get = function (req, res) {
        dao.findById(req.params.competition, req.params.id)
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
                YearsController.responseWithDbConnectionError(res);
            })
    };

    static create = async function (req, res) {

        // Validate request
        if (!req.body.yearsItem) {
            res.status(400).send({ message: "Content can not be empty!" });
            return;
        }

        let newYearsItem = new YearsItemBuilder()
            .setTitle(req.body.yearsItem.title)
            .setContent(req.body.yearsItem.content)
            .setAuthor(req.body.yearsItem.author)
            .build();

        dao.create(req.params.competition, newYearsItem)
            .then(data => {
                console.log(data);
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                res.send(err);
            })
    };

    static update = async function (req, res) {
        if (!req.params.id) {
            res.status(400).send({ message: "Id can not be empty!" });
            return;
        }
        let yearsItem = await dao.findById(req.params.competition, req.params.id);
        if (req.body.title) { yearsItem.updateTitle(req.body.title) };
        if (req.body.content) { yearsItem.updateContent(req.body.content) };
        dao.update(req.params.competition, yearsItem)
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
        dao.remove(req.params.competition, req.params.id)
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