'use strict';

const { v4: uuidv4 } = require('uuid');

const Gender = {
    M: {code: "M", value: "male"},
    F: {code: "F", value: "female"}
 };
 Object.freeze(Gender);

class UserBuilder {
    setIdFromDb(value) {
        this.idFromDb = value;
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

    setBirthDate(value) {
        this.birthDate = value;
        return this;
    }

    setGender(value) {
        this.gender = value;
        return this;
    }

    setEmail(value) {
        this.email = value;
        return this;
    }

    build() {
        if (!('firstName' in this)) {
            throw new Error('FirstName is missing.');
        }
        if (!('lastName' in this)) {
            throw new Error('LastName is missing.');
        }
        if (!('birthDate' in this)) {
            throw new Error('BirthDate is missing.');
        }
        if (!('gender' in this)) {
            throw new Error('Gender is missing.');
        }
        if (!('email' in this)) {
            throw new Error('Email is missing.');
        }
        let genderIsOk = false;
        for (let g in Gender) {
            if (Gender[g] === this.gender) {
                genderIsOk = true;
                break;
            }
        }
        if (!genderIsOk) {
            throw new Error('Bad value for gender: ' + this.gender);
        }

        if (!this.idFromDb) {
            return new User({builder:this});
        } else {
            return new User({idFromDb:this.idFromDb, builder:this});
        }
    }
}

class User {
    constructor(data) {
        if (!data.idFromDb) {
            this.id = uuidv4();
        } else {
            this.id = data.idFromDb;
        }
        this.firstName = data.builder.firstName;
        this.lastName = data.builder.lastName;
        this.birthDate = data.builder.birthDate;
        this.gender = data.builder.gender;
        this.email = data.builder.email;
    }
}

module.exports = { UserBuilder, User, Gender }