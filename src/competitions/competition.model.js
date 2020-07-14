'use strict';

const uuid = require('uuid').v4;

module.exports = {
    find() {
        console.log("Model Competition find...")
        const fakeResult = [{
                title: "aaa",
                year: 1975,
                description: "",
                published: true
            },
            {
                title: "aaa",
                year: 1975,
                description: "",
                published: true
            }]

        return new Promise((resolve, reject) => {
                resolve(fakeResult);
            })
    },
    findById(id, data) {
        console.log("Model Competition find by id: ", id)
        const fakeResult = {
                title: "aaa",
                year: 1975,
                description: "",
                published: true
            }

        return new Promise((resolve, reject) => {
                resolve(fakeResult);
            })
    },
    create(data) {
        const id = uuid.create();
        console.log("Model Competition create: ", ID)
        const fakeResult = {
                ID: id,
                title: "aaa",
                year: 1975,
                description: "",
                published: true
            }

        return new Promise((resolve, reject) => {
                resolve(fakeResult);
            })
    },
}