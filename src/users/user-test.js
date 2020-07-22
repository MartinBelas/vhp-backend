'use strict';

const assert = require('assert');
const { User, UserBuilder, Gender } = require('./user.js');

const FIRST_NAME = 'Karel';
const LAST_NAME = 'Gott';
const BIRTH_DATE = 'zzz';
const EMAIL = 'zzz';
const GENDER = Gender.M;

describe('creating new User using UsersBuilder', () => { 

    it('when all is set ok', () => {
        
        const builder = new UserBuilder();
        const testUser = builder
            .setFirstName(FIRST_NAME)
            .setLastName(LAST_NAME)
            .setBirthDate(BIRTH_DATE)
            .setGender(GENDER)
            .setEmail(EMAIL)
            .build();

        assert.equal(testUser.firstName, FIRST_NAME);
        assert.equal(testUser.lastName, LAST_NAME);
        assert.equal(testUser.birthDate, BIRTH_DATE);
        assert.equal(testUser.gender, GENDER);
        assert.equal(testUser.email, EMAIL);
    })

    it('when gender not from Gender enum then throws error', () => {
        
        const builder = new UserBuilder();
        const badGender = 'koko';

        assert.throws(() => { builder
                .setFirstName(FIRST_NAME)
                .setLastName(LAST_NAME)
                .setBirthDate(BIRTH_DATE)
                .setGender(badGender)
                .setEmail(EMAIL)
                .build();
        }, new Error('Bad value for gender: ' + badGender));
    })

    describe('throws error when ', function() {
        
        it('empty first name', () => {
            
            const builder = new UserBuilder();

            assert.throws(() => { builder
                        .setLastName(LAST_NAME)
                        .setGender(GENDER)
                        .build();
                }, new Error('FirstName is missing.'));
        })

        it('empty last name', () => {
            
            const builder = new UserBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setGender(GENDER)
                        .build();
                }, new Error('LastName is missing.'));
        })

        it('empty gender', () => {
            
            const builder = new UserBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setLastName(LAST_NAME)
                        .setBirthDate(BIRTH_DATE)
                        .setEmail(EMAIL)
                        .build();
                }, new Error('Gender is missing.'));
        })

        it('empty email', () => {
            
            const builder = new UserBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setLastName(LAST_NAME)
                        .setBirthDate(BIRTH_DATE)
                        .setGender(GENDER)
                        .build();
                }, new Error('Email is missing.'));
        })

        it('empty birthDate', () => {
            
            const builder = new UserBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setLastName(LAST_NAME)
                        .setGender(GENDER)
                        .setEmail(EMAIL)
                        .build();
                }, new Error('BirthDate is missing.'));
        })
    })
})

describe('reading User from db using UsersBuilder', () => { 

    it('when all is set ok', () => {

        const idFromDb = 'some-id-from-db';
        
        const builder = new UserBuilder();
        const testUser = builder
            .setIdFromDb(idFromDb)
            .setFirstName(FIRST_NAME)
            .setLastName(LAST_NAME)
            .setBirthDate(BIRTH_DATE)
            .setGender(GENDER)
            .setEmail(EMAIL)
            .build();

        assert.equal(testUser.id, idFromDb);
        assert.equal(testUser.firstName, FIRST_NAME);
        assert.equal(testUser.lastName, LAST_NAME);
        assert.equal(testUser.birthDate, BIRTH_DATE);
        assert.equal(testUser.gender, GENDER);
        assert.equal(testUser.email, EMAIL);
    })
})