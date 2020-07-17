'use strict';

const assert = require('assert');
const { User, UserBuilder, Gender } = require('./user.js');

const FIRST_NAME = 'Karel';
const LAST_NAME = 'Gott';
const GENDER = Gender.M;

it('should return true', () => {
    assert.equal(true, true)
})

describe('using UsersBuilder', () => { 

    it('creates new User using UsersBuilder', () => {
        
        const builder = new UserBuilder();
        const testUser = builder
            .setFirstName(FIRST_NAME)
            .setLastName(LAST_NAME)
            .setGender(GENDER)
            .build();

        console.log(" --> TEST USER: ", testUser);

        assert.equal(testUser.firstName, FIRST_NAME);
        assert.equal(testUser.lastName, LAST_NAME);
        assert.equal(testUser.gender, GENDER);
    })

    it('when creating new User with gender not from Gender enum then throws error', () => {
        
        const builder = new UserBuilder();
        var badGender = 'koko';

        assert.throws(() => { builder
                .setFirstName(FIRST_NAME)
                .setLastName(LAST_NAME)
                .setGender(badGender)
                .build();;
        }, new Error('Bad value for gender: ' + badGender));
    })

    describe('throws error when ', function() {
        
        it('creating a new User with empty first name', () => {
            
            const builder = new UserBuilder();

            assert.throws(() => { builder
                        .setLastName(LAST_NAME)
                        .setGender(GENDER)
                        .build();
                }, new Error('FirstName is missing.'));
        })

        it('creating a new User with empty last name', () => {
            
            const builder = new UserBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setGender(GENDER)
                        .build();
                }, new Error('LastName is missing.'));
        })

        // it('creating a new User with empty gender', () => {
            
        //     const builder = new UserBuilder();

        //     assert.throws(() => { builder
        //                 .setFirstName(FIRST_NAME)
        //                 .setLastName(LAST_NAME)
        //                 .build();
        //         }, new Error('Gender is missing.'));
        // })
    })
})