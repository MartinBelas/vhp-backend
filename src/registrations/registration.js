'use strict';

const { v4: uuidv4 } = require('uuid');

const Sex = {
    M: {code: "M", value: "male"},
    F: {code: "F", value: "female"}
 };
 Object.freeze(Sex);

class RegistrationBuilder {
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

    setBirth(value) {
        this.birth = value;
        return this;
    }

    setSex(value) {
        this.sex = value;
        return this;
    }

    setEmail(value) {
        this.email = value;
        return this;
    }

    setAddress(value) {
        this.address = value;
        return this;
    }

    setPhone(value) {
        this.phone = value;
        return this;
    }

    setClub(value) {
        this.club = value;
        return this;
    }

    setRace(value) {
        this.race = value;
        return this;
    }

    setComment(value) {
        this.comment = value;
        return this;
    }

    setPaid(value) {
        this.paid = value;
        return this;
    }

    build() {
        if (!(this.firstName)) {
            throw new Error('FirstName is missing.');
        }
        if (!(this.lastName)) {
            throw new Error('LastName is missing.');
        }
        if (!(this.birth)) {
            throw new Error('Birth year is missing.');
        }
        if (!(this.sex)) {
            throw new Error('Sex is missing.');
        }
        if (!(this.email)) {
            throw new Error('Email is missing.');
        }
        let sexIsOk = false;
        for (let g in Sex) {
            if (Sex[g] === this.sex) {
                sexIsOk = true;
                break;
            }
        }
        if (!sexIsOk) {
            throw new Error('Bad value for sex: ' + this.sex);
        }

        return new Registration(this);
    }
}

class Registration {
    constructor(builder) {
        if (!builder.idFromDb) {
            this.id = uuidv4();
        } else {
            this.id = builder.idFromDb;
        }
        this.email = builder.email;
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.birth = builder.birth;
        this.sex = builder.sex;
        this.address = builder.address;
        this.phone = builder.phone;
        this.club = builder.club;
        this.race = builder.race;
        this.comment = builder.comment;
        this.paid = builder.paid;
        this.category = builder.category;
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

module.exports = { RegistrationBuilder, Registration, Sex }