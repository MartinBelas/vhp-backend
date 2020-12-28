'use strict';

const NewsDao = require('./news-dao-mysql');
const { NewsItemBuilder } = require('./news');

const dao = new NewsDao();

module.exports = class NewsController {

    static getAll = function (req, res) {
        console.log('Ctrl GET All News');
        dao.find(req.params.competition)
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                NewsController.responseWithDbConnectionError(res);
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
                NewsController.responseWithDbConnectionError(res);
            })
    };

    static create = async function (req, res) {

        
        AdminController.authenticate(req, res)
            .then( authenticationResult => {

                // Validate request
                if (!req.body.newsItem) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }

                let newNewsItem = new NewsItemBuilder()
                    .setTitle(req.body.newsItem.title)
                    .setContent(req.body.newsItem.content)
                    .setAuthor(req.body.newsItem.author)
                    .build();

                dao.create(req.params.competition, newNewsItem)
                    .then(data => {
                        console.log(data);
                        res.json(data);
                    })
                    .catch(err => {
                        console.error(err);
                        res.send(err);
                    })
            }).catch( authenticationFailure => {
                res.status(authenticationFailure).end();
            })
    };

    static update = async function (req, res) {

        AdminController.authenticate(req, res)
            .then( authenticationResult => {

                if (!req.params.id) {
                    res.status(400).send({ message: "Id can not be empty!" });
                    return;
                }
                let newsItem = dao.findById(req.params.competition, req.params.id);
                if (req.body.title) { newsItem.updateTitle(req.body.title) };
                if (req.body.content) { newsItem.updateContent(req.body.content) };
                dao.update(req.params.competition, newsItem)
                    .then(data => {
                        console.log(data);
                        data = JSON.parse(JSON.stringify(data));
                    })
                    .catch(err => {
                        console.error(err);
                        res.send(err);
                    });
            }).catch( authenticationFailure => {
                res.status(authenticationFailure).end();
            })
    };

    static delete = function (req, res) {

        AdminController.authenticate(req, res)
            .then( authenticationResult => {
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
            }).catch( authenticationFailure => {
                res.status(authenticationFailure).end();
            })
    };

    static responseWithDbConnectionError = function (res) {
        res.status(503);
        res.send({
            "message":"Error when connecting to db."
        });
    };
}