'use strict';

module.exports = function CompetitionsRouter(app) {

    const competitionsController = require('./competitions.controller.js');
    let router = require("express").Router();

    // app.router('/competitions')
    //   .get(competitionsController.getAll)
    //   .post(competitionsController.create);
  
  
    // app.router('/competitions/:id')
    //   .get(competitionsController.get)
    //   .put(competitionsController.update)
    //   .delete(competitionsController.delete);

    app.use('/api/competitions', router);
    
    router.get("/", competitionsController.getAll);
    router.get("/:id", competitionsController.get);
	
	router.post("/", competitionsController.create);
};
