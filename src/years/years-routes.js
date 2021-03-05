`use strict`;

module.exports = function YearsRouter(app) {

    const controller = require(`./years-controller.js`);
    const router = require(`express`).Router();
	
    app.use(`/api`, router);
    
    const apiPath = `/:competition/years`;

    router.get(apiPath, controller.getAll);
    router.get(apiPath + `/last`, controller.getLast);
    router.get(apiPath + `/next`, controller.getNext);
    router.get(apiPath + `/:id`, controller.get);
	
    router.post(apiPath + `/`, controller.create);
    
    router.put(apiPath + `/:id`, controller.update)
    router.delete(apiPath + `/:id`, controller.delete);

    router.get(apiPath + `/next/races`, controller.getNextRaces);
};
