`use strict`;

module.exports = function CompetitionsRouter(app) {

    const competitionsController = require(`./competitions.controller.js`);
    const router = require(`express`).Router();
	
	app.use(`/api/competitions`, router);

    // app.router('/competitions')
    //   .get(competitionsController.getAll)
    //   .post(competitionsController.create);
  
  
    // app.router('/competitions/:id')
    //   .get(competitionsController.get)
    //   .put(competitionsController.update)
    //   .delete(competitionsController.delete);

    router.get(`/`, competitionsController.getAll);
    router.get(`/:id`, competitionsController.get);	// id or name
	
	router.post(`/`, competitionsController.create);
};
