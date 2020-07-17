`use strict`;

module.exports = function UsersRouter(app) {

    const controller = require(`./users-controller.js`);
    const router = require(`express`).Router();
	
	app.use(`/api/users`, router);

    // app.router('/competitions')
    //   .get(competitionsController.getAll)
    //   .post(competitionsController.create);
  
  
    // app.router('/competitions/:id')
    //   .get(competitionsController.get)
    //   .put(competitionsController.update)
    //   .delete(competitionsController.delete);

    router.get(`/`, controller.getAll);
    router.get(`/:id`, controller.get);
	
	router.post(`/`, controller.create);
};
