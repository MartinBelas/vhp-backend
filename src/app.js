'use strict';
require('custom-env').env();

const config = require('./config.js');

const express = require('express');
const app = express();

const AdminRouter = require('./auth/admin/admin-routes.js');
const LoginRouter = require('./auth/login/login-routes.js');
const CompetitionsRouter = require('./competitions/competitions.routes.js');
const YearsRouter = require('./years/years-routes.js');
const NewsRouter = require('./news/news-routes.js');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});

app.use(express.static("public"));

app.use(function (req, res, next) {

    if (req.headers['api-key'] && (req.headers['api-key']===process.env.API_KEY)) {
        return next();
    } else {
        res.end();
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

AdminRouter(app);
LoginRouter(app);
CompetitionsRouter(app);
YearsRouter(app);
NewsRouter(app);

const PORT = process.env.PORT || config.port || 3000;

app.listen(PORT, function () {
    console.log('app listening at port %s', PORT);
});