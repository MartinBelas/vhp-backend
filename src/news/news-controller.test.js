const express = require('express')
const app = express()

const index = require("./news-controller.js");

// Middlewares...
// Routes...

module.exports = app

const app = require("./server");
app.listen(5000, () => {
  console.log("Server has started!");
});




// const request = require("supertest");
// const express = require("express");
// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use("/", index);

// test("index route works", done => {
//     request(app)
//         .get("/")
//         .expect("Content-Type", /json/)
//         .expect({ name: "frodo" })
//         .expect(200, done);
// });

describe('news controller - GET ALL news', () => { 

    it('should return all news', () => {

        request(app)
            .get(REST_API + '/')
            .expect(400, done);

    })
})