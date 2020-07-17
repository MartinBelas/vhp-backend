'use strict';

const { v4: uuidv4 } = require('uuid');

const Gender = {
    M: {code: "M", value: "male"},
    F: {code: "F", value: "female"}
 };
 Object.freeze(Gender);

class UserBuilder {
    setId(value) {
        this.id = value;
        return this;
    }

    setFirstName(value) {
        this.firstName = value;
        return this;
    }
    
    setLastName(value) {
        this.lastName = value;
        return this;
    }

    setGender(value) {
        console.log('SET GENDER: ', value);
        this.gender = value;
        return this;
    }

    build() {
        if (!('firstName' in this)) {
            throw new Error('FirstName is missing.');
        }
        if (!('lastName' in this)) {
            throw new Error('LastName is missing.');
        }
        if (!('gender' in this)) {
            throw new Error('Gender is missing.');
        }
        var genderIsOk = false;
        for (var g in Gender) {
            if (Gender[g] === this.gender) {
                console.log('Gender is OK: ', g);
                genderIsOk = true;
                break;
            }
        }
        if (!genderIsOk) {
            console.log('THIS GENDER: ', this.gender);
            throw new Error('Bad value for gender: ' + this.gender);
        }
        return new User(this);
    }
}

class User {
    constructor(builder) {
        if (!this.id) {this.id = uuidv4();}
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.gender = builder.gender;
    }
}

module.exports = { UserBuilder, User, Gender }