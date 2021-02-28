'use strict';

const assert = require('assert');
const { Registration, RegistrationBuilder, Sex } = require('./registration.js');

const FIRST_NAME = 'Karel';
const LAST_NAME = 'Gott';
const BIRTH_DATE = 'zzz';
const EMAIL = 'zzz';
const SEX = Sex.M;

describe('creating new Registration using RegistrationsBuilder', () => { 

    it('when all is set ok', () => {
        
        const builder = new RegistrationBuilder();
        const testRegistration = builder
            .setFirstName(FIRST_NAME)
            .setLastName(LAST_NAME)
            .setBirth(BIRTH_DATE)
            .setSex(SEX)
            .setEmail(EMAIL)
            .build();

        assert.equal(testRegistration.firstName, FIRST_NAME);
        assert.equal(testRegistration.lastName, LAST_NAME);
        assert.equal(testRegistration.birth, BIRTH_DATE);
        assert.equal(testRegistration.sex, SEX);
        assert.equal(testRegistration.email, EMAIL);
    })

    it('when sex not from Sex enum then throws error', () => {
        
        const builder = new RegistrationBuilder();
        const badSex = 'koko';

        assert.throws(() => { builder
                .setFirstName(FIRST_NAME)
                .setLastName(LAST_NAME)
                .setBirth(BIRTH_DATE)
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
                        .setBirth(BIRTH_DATE)
                        .setEmail(EMAIL)
                        .build();
                }, new Error('Sex is missing.'));
        })

        it('empty email', () => {
            
            const builder = new RegistrationBuilder();

            assert.throws(() => { builder
                        .setFirstName(FIRST_NAME)
                        .setLastName(LAST_NAME)
                        .setBirth(BIRTH_DATE)
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
                }, new Error('Birth year is missing.'));
        })
    })
})

describe('reading Registration from db using RegistrationsBuilder', () => { 

    it('when all is set ok', () => {

        const idFromDb = 'some-id-from-db';
        
        const builder = new RegistrationBuilder();
        const testRegistration = builder
            .setIdFromDb(idFromDb)
            .setFirstName(FIRST_NAME)
            .setLastName(LAST_NAME)
            .setBirth(BIRTH_DATE)
            .setSex(SEX)
            .setEmail(EMAIL)
            .build();

        assert.equal(testRegistration.id, idFromDb);
        assert.equal(testRegistration.firstName, FIRST_NAME);
        assert.equal(testRegistration.lastName, LAST_NAME);
        assert.equal(testRegistration.birth, BIRTH_DATE);
        assert.equal(testRegistration.sex, SEX);
        assert.equal(testRegistration.email, EMAIL);
    })
})