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
        if (!(this.firstName)) {
            throw new Error('FirstName is missing.');
        }
        if (!(this.lastName)) {
            throw new Error('LastName is missing.');
        }
        if (!(this.birthDate)) {
            throw new Error('BirthDate is missing.');
        }
        if (!(this.gender)) {
            throw new Error('Gender is missing.');
        }
        if (!(this.email)) {
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

        return new User(this);
    }
}

class User {
    constructor(builder) {
        if (!builder.idFromDb) {
            this.id = uuidv4();
        } else {
            this.id = builder.idFromDb;
        }
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.birthDate = builder.birthDate;
        this.gender = builder.gender;
        this.email = builder.email;
    }

    updateLastName(value) {
        if (value) {
            this.lastName = value;
        }
    }

    updateEmail(value) {
        if (value) {
            this.email = value;
        }
    }
}

module.exports = { UserBuilder, User, Gender }