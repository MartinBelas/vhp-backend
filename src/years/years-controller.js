'use strict';

const YearsDao = require('./years-dao-mysql');
const CategoriesDao = require('./categories/categories-dao-mysql');
const RacesDao = require('./races/races-dao-mysql');
const { YearBuilder } = require('./year');
const { ResultBuilder } = require('../common/result');
const DateService = require('../common/DateService.js');

const dao = new YearsDao();

module.exports = class YearsController {

    static getAll = function (req, res) {
        dao.find(req.params.competition)
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                YearsController.responseWithDbConnectionError(res);
            })
    };

    static getLast = async function (req, res) {
        const competition = req.params.competition;
        
        let lastYear;
        try {
            lastYear = (await dao.findLast(competition));
        } catch(err) {
            console.error(err);
            YearsController.responseWithDbConnectionError(res);
        }
        
        try {
            const promises = [];

            const categoriesDao = new CategoriesDao(lastYear.vhpYear);
            promises.push(categoriesDao.find(competition));

            const racesDao = new RacesDao(lastYear.vhpYear);
            promises.push(racesDao.find(competition));

            const result = await Promise.all(promises);
            const categories = result[0];
            const races = result[1];
            
            lastYear.setCategories(categories);
            lastYear.setRaces(races);
            res.status(200).json(lastYear);
        } catch(err) {
            console.error(err);
            YearsController.responseWithDbConnectionError(res);
        }
    };

    static getNext = async function (req, res) {
        const competition = req.params.competition;

        try {
            const nextDate = (await dao.findNextYear(competition))

            if (!nextDate.isOk) {
                const result = new ResultBuilder()
                    .setIsOk(true)
                    .setData(nextDate)
                    .build();
                res.status(200).send(result);
                return;    
            }
            const nextYear = nextDate.vhpYear;

            //TODO rm
            // const racesDao = new RacesDao(nextYear);
            // racesDao.find(competition)

            res.status(200).json(nextDate);
        } catch(err) {
            console.error('ERR Years ctrl, get next year: ', err);
            YearsController.responseWithDbConnectionError(res);
        }
    };

    static getNextRaces = async function (req, res) {
        const competition = req.params.competition;

        let nextDate;
        try {
            nextDate = (await dao.findNextYear(competition))
            const nextYearDate = nextDate.date;

            if (!DateService.isInFuture(nextYearDate)) {
                const msg = 'No races in future defined.';
                console.log(msg);
                const result = new ResultBuilder()
                    .setIsOk(false)
                    .setSuggestedStatus(404)
                    .setErrMessage(msg)
                    .build();
                res.status(result.suggestedStatus).send(result.errMessage);
                return;
            }

            const nextYear = nextYearDate.substring(0,4);
            
            const racesDao = new RacesDao(nextYear);
            racesDao.find(competition)
                .then(result => {
                    if (result.error) {
                        if (result.suggestedStatus) {
                            res.status(result.suggestedStatus);
                        }
                        res.json(result.error);
                    } else {
                        const races = result.data;
                        res.status(200).json(result);
                    }
                })
                .catch(err => {
                    console.error(err);
                    YearsController.responseWithDbConnectionError(res);
                })

        } catch(err) {
            console.error('ERR Years ctrl, get races: ', err);
            YearsController.responseWithDbConnectionError(res);
        }
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
            res.status(400).send({ message: "Next date cannot be empty!" });
            return;
        }

        const lastCounter = await dao.findLastCounter(req.params.competition);
        const nextCounter = lastCounter + 1;

        let nextYear = new YearBuilder()
            .setVhpYear(req.body.nextDate.substring(0, 4))
            .setVhpDate(req.body.nextDate)
            .setVhpCounter(nextCounter)
            .setAcceptRegistrations(req.body.acceptRegistrations)
            .build();

        const categories = req.body.categories;
        const races = req.body.races;
            
        nextYear.setCategories(categories);
        nextYear.setRaces(races);

        dao.create(req.params.competition, nextYear)
            .then(data => {
                console.log("Years ctrl, next year created: ", data);
                res.json(data);
            })
            .catch(err => {
                console.log("ERR Years ctrl, next year creating: ", err);
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
            "message":"DB Error."
        });
    };
}