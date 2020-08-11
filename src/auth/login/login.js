'use strict';

class LoginBuilder {
    setCompetition(value) {
        this.competition = value;
        return this;
    }
    
    setEmail(value) {
        this.email = value;
        return this;
    }

    setPassword(value) {
        this.password = value;
        return this;
    }

    build() {
        if (!(this.competition)) {
            throw new Error('Competition is missing.');
        }
        if (!(this.email)) {
            throw new Error('User/email is missing.');
        }
        if (!(this.password)) {
            throw new Error('Password is missing.');
        }
        return new Login(this);
    }
}

class Login {
    constructor(builder) {
        this.competition = builder.competition;
        this.email = builder.email;
        this.password = builder.password;
    }
}

module.exports = { LoginBuilder, Login }