`use strict`;

module.exports = function AdminRouter(app) {

    const controller = require(`./admin-controller.js`);
    const router = require(`express`).Router();
	
	app.use(`/api/auth/admin`, router);

    router.post(`/`, controller.create);
};
