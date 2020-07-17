'use strict';

const config = require('./config.js');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

//const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/users-routes.js');
const CompetitionsRouter = require('./competitions/competitions.routes.js');

app.use(function (req, res, next) {
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Credentials', 'true');
    // res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    // res.header('Access-Control-Expose-Headers', 'Content-Length');
    // res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// AuthorizationRouter.routesConfig(app);
UsersRouter(app);
CompetitionsRouter(app);

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
})

app.post('/', function (req, res) {
    console.log("Got a POST request for the homepage, data: ", req.body);
    //res.status(201).send('Hello POST, data: ' + JSON.stringify(req.body));
    res.status(201).json(req.body);
})

app.listen(config.port, function () {
    console.log('app listening at port %s', config.port);
});