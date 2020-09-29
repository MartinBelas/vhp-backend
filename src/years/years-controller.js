'use strict';

const YearsDao = require('./years-dao-mysql');
const CategoriesDao = require('../categories/categories-dao-mysql');
const { YearBuilder } = require('./year');

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
                    //TODO if req.params.withCategories ??
                    const year = result.vhpYear;
                    const categoriesDao = new CategoriesDao(year);
                    categoriesDao.find(req.params.competition)
                        .then(categoriesResult => {
                            if (categoriesResult.error) {
                                if (categoriesResult.suggestedStatus) {
                                    res.status(categoriesResult.suggestedStatus);
                                }
                                res.json(categoriesResult.error);
                            } else {
                                result.categories = categoriesResult;
                                res.status(200).json(result);
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            YearsController.responseWithDbConnectionError(res);
                        })
                }
            })
            .catch(err => {
                console.error(err);
                YearsController.responseWithDbConnectionError(res);
            })
        //console.log('-- 2 - Year: ', year); //TODO remove
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
        if (!req.body.nextDate) {
            res.status(400).send({ message: "Next date can not be empty!" });
            return;
        }

        let nextYearItem = new YearBuilder()
            .setVhpYear(req.body.nextDate.substring(0, 4))
            .setVhpDate(req.body.nextDate)
            .build();

        dao.create(req.params.competition, nextYearItem)
            .then(data => {
                console.log(data);
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                res.send(err);
            })

        //TODO creatre tables for next year categories, races and registrations
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