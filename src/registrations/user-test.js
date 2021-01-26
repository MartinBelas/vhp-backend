'use strict';

const assert = require('assert');
const { User, RegistrationBuilder, Sex } = require('./user.js');

const FIRST_NAME = 'Karel';
const LAST_NAME = 'Gott';
const BIRTH_DATE = 'zzz';
const EMAIL = 'zzz';
const SEX = Sex.M;

describe('creating new User using UsersBuilder', () => { 

    it('when all is set ok', () => {
        
        const builder = new RegistrationBuilder();
        const testUser = builder
            .setFirstName(FIRST_NAME)
            .setLastName(LAST_NAME)
            .setBirthDate(BIRTH_DATE)
            .setSex(SEX)
            .setEmail(EMAIL)
            .build();

        assert.equal(testUser.firstName, FIRST_NAME);
        assert.equal(testUser.lastName, LAST_NAME);
        assert.equal(testUser.birthDate, BIRTH_DATE);
        assert.equal(testUser.sex, SEX);
        assert.equal(testUser.email, EMAIL);
    })

    it('when sex not from Sex enum then throws error', () => {
        
        const builder = new RegistrationBuilder();
        const badSex = 'koko';

        assert.throws(() => { builder
                .setFirstName(FIRST_NAME)
                .setLastName(LAST_NAME)
                .setBirthDate(BIRTH_DATE)
                .setSex(badSex)
                .setEmail(EMAIL)
                .build();
        }, new Error('Bad value for sex: ' + badSex));
    })

    describe('throws error when ', function() {
        
        it('empty first name', () => {
            
            const builder = new RegistrationBuilder();

            assert.throws(() => { builder
                        .setLastName(LAST_NAME)
                        .setSex(SEX)
                        .build();
                }, new Error('FirstName is missing.'));
        })

        it('empty last name', () => {
            
            const builder = new RegistrationBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setSex(SEX)
                        .build();
                }, new Error('LastName is missing.'));
        })

        it('empty sex', () => {
            
            const builder = new RegistrationBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setLastName(LAST_NAME)
                        .setBirthDate(BIRTH_DATE)
                        .setEmail(EMAIL)
                        .build();
                }, new Error('Sex is missing.'));
        })

        it('empty email', () => {
            
            const builder = new RegistrationBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setLastName(LAST_NAME)
                        .setBirthDate(BIRTH_DATE)
                        .setSex(SEX)
                        .build();
                }, new Error('Email is missing.'));
        })

        it('empty birthDate', () => {
            
            const builder = new RegistrationBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setLastName(LAST_NAME)
                        .setSex(SEX)
                        .setEmail(EMAIL)
                        .build();
                }, new Error('BirthDate is missing.'));
        })
    })
})

describe('reading User from db using UsersBuilder', () => { 

    it('when all is set ok', () => {

        const idFromDb = 'some-id-from-db';
        
        const builder = new RegistrationBuilder();
        const testUser = builder
            .setIdFromDb(idFromDb)
            .setFirstName(FIRST_NAME)
            .setLastName(LAST_NAME)
            .setBirthDate(BIRTH_DATE)
            .setSex(SEX)
            .setEmail(EMAIL)
            .build();

        assert.equal(testUser.id, idFromDb);
        assert.equal(testUser.firstName, FIRST_NAME);
        assert.equal(testUser.lastName, LAST_NAME);
        assert.equal(testUser.birthDate, BIRTH_DATE);
        assert.equal(testUser.sex, SEX);
        assert.equal(testUser.email, EMAIL);
    })
})