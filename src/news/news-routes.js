`use strict`;

module.exports = function NewsRouter(app) {

    const controller = require(`./news-controller.js`);
    const router = require(`express`).Router();
    
    app.use(`/api`, router);
    
    const apiPath = `/:competition/news`;

    router.get(apiPath, controller.getAll);
    router.get(apiPath + `/:id`, controller.get);
    
    router.post(apiPath + `/`, controller.create);
    
    router.put(apiPath + `/:id`, controller.update)
    router.delete(apiPath + `/:id`, controller.delete);
};
