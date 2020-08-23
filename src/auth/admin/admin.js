'use strict';

class AdminBuilder {

    setEmail(value) {
        this.email = value;
        return this;
    }

    setPassword(value) {
        this.password = value;
        return this;
    }

    build() {
        if (!(this.email)) {
            throw new Error('User/Email is missing.');
        }
        if (!(this.password)) {
            throw new Error('Password is missing.');
        }
        return new Admin(this);
    }
}

class Admin {
    constructor(builder) {
        this.email = builder.email;
        this.password = builder.password;
    }
}

module.exports = { AdminBuilder, Admin }