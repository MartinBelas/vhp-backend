`use strict`;

module.exports = function UsersRouter(app) {

    const controller = require(`./users-controller.js`);
    const router = require(`express`).Router();
	
	app.use(`/api/users`, router);

    router.get(`/`, controller.getAll);
    router.get(`/:id`, controller.get);
	
    router.post(`/`, controller.create);
    
    router.put(`/:id`, controller.update)
    router.delete(`/:id`, controller.delete);
};
