'use strict';

const assert = require('assert');
const { Login, LoginBuilder } = require('./login.js');

const COMPETITION = 'zzz';
const EMAIL = 'Karel@Veliky.xx';
const PASSWORD = 'xyz';

describe('creating new LoginAttempt using LoginBuilder', () => { 

    it('when all is set ok', () => {
        
        const builder = new LoginBuilder();
        const testLogin = builder
            .setCompetition(COMPETITION)
            .setEmail(EMAIL)
            .setPassword(PASSWORD)
            .build();

        assert.equal(testLogin.competition, COMPETITION);
        assert.equal(testLogin.email, EMAIL);
        assert.equal(testLogin.password, PASSWORD);
    })

    it('when competition not set then throws error', () => {
        
        const builder = new LoginBuilder();
        
        assert.throws(() => { builder
            .setEmail(EMAIL)
            .setPassword(PASSWORD)
            .build();
        }, new Error('Competition is missing.'));
    })

})
