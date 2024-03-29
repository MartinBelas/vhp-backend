'use strict';

const AdminController = require('../auth/admin/admin-controller.js');
const NewsDao = require('./news-dao-mysql');
const { NewsItemBuilder } = require('./news');
const ApiKeyService = require('../common/ApiKeyService');

const dao = new NewsDao();

module.exports = class NewsController {

    static getAll = function (req, res) {

        if (ApiKeyService.getApiKeyOk()) {
            dao.find(req.params.competition, req.query.count)
                .then(data => {
                    res.json(data);
                })
                .catch(err => {
                    console.log('ERR Get All News: ', err);
                    NewsController.responseWithDbConnectionError(res);
                })
        }
    };

    static get = function (req, res) {

        if (ApiKeyService.getApiKeyOk()) {
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
                    console.error('ERR Get One News: ', err);
                    NewsController.responseWithDbConnectionError(res);
                })
        }
    };

    static create = async function (req, res) {
        
        AdminController.authenticate(req, res)
            .then( authenticationResult => {

                // Validate request
                if (!req.body.news) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }

                let newNewsItem = new NewsItemBuilder()
                    .setTitle(req.body.news.title)
                    .setContent(req.body.news.content)
                    .setAuthor(authenticationResult.user)
                    .build();

                dao.create(req.params.competition, newNewsItem)
                    .then(data => {
                        console.log('Create News: ', data);
                        res.json(data);
                    })
                    .catch(err => {
                        console.log('ERR Create News: ', err);
                        res.send(err);
                    })
            }).catch( authenticationFailure => {
                res.status(authenticationFailure).end();
            })
    };

    static update = async function (req, res) {

        AdminController.authenticate(req, res)
            .then( () => {
                if (!req.params.id) {
                    res.status(400).send({ message: "Id can not be empty!" });
                    return;
                }
                let news = dao.findById(req.params.competition, req.params.id);
                return news;
            })
            .then( (news) => {
                if (req.body.news.title) { news.updateTitle(req.body.news.title) };
                if (req.body.news.content) { news.updateContent(req.body.news.content) };
                dao.update(req.params.competition, news)
                    .then(data => {
                        res.json(data);
                    })
                    .catch(err => {
                        console.log('ERR Update News: ', err);
                        res.send(err);
                    });
            }).catch( authenticationFailure => {
                res.status(authenticationFailure).end();
            })
    };

    static delete = function (req, res) {

        AdminController.authenticate(req, res)
            .then( () => {
                if (!req.params.id) {
                    res.status(400).send({ message: "Id can not be empty!" });
                    return;
                }
                dao.remove(req.params.competition, req.params.id)
                    .then(data => {
                        res.json(data);
                    })
                    .catch(err => {
                        console.log('ERR Delete News: ', err);
                        res.send(err.message);
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