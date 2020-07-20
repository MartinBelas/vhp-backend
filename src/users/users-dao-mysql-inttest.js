'use strict';
require('custom-env').env('test');

const assert = require('assert');
const { UserBuilder, Gender } = require('./user');

const dbConnection = require('../mysqlDbConnection');
const UsersDao = require('./users-dao-mysql');
const dao = new UsersDao();

describe('users-dao-mysql-inttest', function() { 

    before(function() {
        // runs before all tests in this block
    });

    // runs after all tests in this block
    after(async function() {
        await clearTblUsers();
    });
    
    // runs before each test in this block
    beforeEach(async function() {
        await clearTblUsers();
    });
    
    // runs after each test in this block
    afterEach(function() {
    });

    describe('#find()', function() {
        it('should find all entities without error', async function() {

            await prepareTblUsers();

            let users = await dao.find();
            assert.equal(users.length, 3);
                
            let albert = users.find(user => user.firstName === 'Albert');
            assert.equal(albert.lastName, 'Armstrong');
            assert.equal(albert.gender.code, 'M');
            assert(albert.email);
            assert(albert.birthDate);

            let bob = users.find(user => user.firstName === 'Bob');
            assert.equal(bob.lastName, 'Brooke');
            assert.equal(bob.gender.value, 'male');

            let clara = users.find(user => user.firstName === 'Clara');
            assert.equal(clara.lastName, 'Carson');
            assert.equal(clara.gender.value, 'female');
        });
    });

    describe('#create()', function() {
        it('should create without error', async function() {

            const firstName = 'Karel';
            const lastName = 'Gott';
            const birthDate = 'aaa';
            const gender = Gender.M;
            const email = 'bbb';

            const karel = new UserBuilder()
                .setFirstName(firstName)
                .setLastName(lastName)
                .setBirthDate(birthDate)
                .setGender(gender)
                .setEmail(email)
                .build();

            let user = await dao.create(karel);
            assert.equal(user.firstName, firstName);
            assert.equal(user.lastName, lastName);
            assert.equal(user.gender, gender);
            assert.equal(user.email, email);
            assert.equal(user.birthDate, birthDate);
        });
    });
});

describe('#update()', function() {
    it('should update last name', async function() {

        const firstName = 'Julie';
        const lastName = 'Bila';
        const birthDate = 'aaa';
        const gender = Gender.F;
        const email = 'bbb';

        let julie = new UserBuilder()
            .setFirstName(firstName)
            .setLastName(lastName)
            .setBirthDate(birthDate)
            .setGender(gender)
            .setEmail(email)
            .build();

        let user = await dao.create(julie);
        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, lastName);
        assert.equal(user.gender, gender);
        assert.equal(user.email, email);
        assert.equal(user.birthDate, birthDate);

        julie.updateLastName('Cerna');
        julie = await dao.update(julie);

        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, 'Cerna');
        assert.equal(user.gender, gender);
        assert.equal(user.email, email);
        assert.equal(user.birthDate, birthDate);
    });

    it('should update email', async function() {

        const firstName = 'Julie';
        const lastName = 'Bila';
        const birthDate = 'aaa';
        const gender = Gender.F;
        const email = 'bbb';

        let julie = new UserBuilder()
            .setFirstName(firstName)
            .setLastName(lastName)
            .setBirthDate(birthDate)
            .setGender(gender)
            .setEmail(email)
            .build();

        let user = await dao.create(julie);
        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, lastName);
        assert.equal(user.gender, gender);
        assert.equal(user.email, email);
        assert.equal(user.birthDate, birthDate);

        let newEmail = 'xx@zz.yy';
        julie.updateEmail(newEmail);
        julie = await dao.update(julie);

        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, lastName);
        assert.equal(user.gender, gender);
        assert.equal(user.email, newEmail);
        assert.equal(user.birthDate, birthDate);
    });
});

async function clearTblUsers() {
    let con = await dbConnection();
    try {
        await con.query("START TRANSACTION");
        await con.query(`DELETE FROM User`);
        await con.query("COMMIT");
        return;
    } catch (ex) {
        await con.query("ROLLBACK");
        console.log(ex);
        throw ex;
    } finally {
        await con.release();
        await con.destroy();
    }
}

async function prepareTblUsers() {
    const builder = new UserBuilder();

    let albert = builder
        .setFirstName('Albert')
        .setLastName('Armstrong')
        .setBirthDate('XXX')
        .setGender(Gender.M)
        .setEmail('XXX')
        .build();

    let bob = builder
        .setFirstName('Bob')
        .setLastName('Brooke')
        .setBirthDate('XXX')
        .setGender(Gender.M)
        .setEmail('XXX')
        .build();

    let clara = builder
        .setFirstName('Clara')
        .setLastName('Carson')
        .setBirthDate('XXX')
        .setGender(Gender.F)
        .setEmail('XXX')
        .build();

    await dao.create(albert);
    await dao.create(bob);
    await dao.create(clara);
}