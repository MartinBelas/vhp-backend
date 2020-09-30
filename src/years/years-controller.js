'use strict';

const YearsDao = require('./years-dao-mysql');
const CategoriesDao = require('./categories/categories-dao-mysql');
const RacesDao = require('./races/races-dao-mysql');
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

    static getLast = async function (req, res) {
        console.log('Ctrl GET LAST Year'); //TODO remove
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
            "message":"DB Error."
        });
    };
}