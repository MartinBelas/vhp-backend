`use strict`;

module.exports = function LoginRouter(app) {

    const controller = require(`./login-controller.js`);
    const router = require(`express`).Router();
	
	app.use(`/api/auth`, router);

    router.post(`/login`, controller.login);
    router.post(`/logout`, controller.logout); //TODO get
    router.post(`/newpassword`, controller.newPasswordRequest);
    router.get(`/newpassword/:confirmation`, controller.newPasswordConfirmation);
};
