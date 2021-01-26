'use strict';
require('custom-env').env('test');

const assert = require('assert');
const { RegistrationBuilder, Sex } = require('./user');

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
            assert.equal(albert.sex.code, 'M');
            assert(albert.email);
            assert(albert.birthDate);

            let bob = users.find(user => user.firstName === 'Bob');
            assert.equal(bob.lastName, 'Brooke');
            assert.equal(bob.sex.value, 'male');

            let clara = users.find(user => user.firstName === 'Clara');
            assert.equal(clara.lastName, 'Carson');
            assert.equal(clara.sex.value, 'female');
        });
    });

    describe('#create()', function() {
        it('should create without error', async function() {

            const firstName = 'Karel';
            const lastName = 'Gott';
            const birthDate = 'aaa';
            const sex = Sex.M;
            const email = 'bbb';

            const karel = new RegistrationBuilder()
                .setFirstName(firstName)
                .setLastName(lastName)
                .setBirthDate(birthDate)
                .setSex(sex)
                .setEmail(email)
                .build();

            let user = await dao.create(karel);
            assert.equal(user.firstName, firstName);
            assert.equal(user.lastName, lastName);
            assert.equal(user.sex, sex);
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
        const sex = Sex.F;
        const email = 'bbb';

        let julie = new RegistrationBuilder()
            .setFirstName(firstName)
            .setLastName(lastName)
            .setBirthDate(birthDate)
            .setSex(sex)
            .setEmail(email)
            .build();

        let user = await dao.create(julie);
        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, lastName);
        assert.equal(user.sex, sex);
        assert.equal(user.email, email);
        assert.equal(user.birthDate, birthDate);

        julie.updateLastName('Cerna');
        julie = await dao.update(julie);

        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, 'Cerna');
        assert.equal(user.sex, sex);
        assert.equal(user.email, email);
        assert.equal(user.birthDate, birthDate);
    });

    it('should update email', async function() {

        const firstName = 'Julie';
        const lastName = 'Bila';
        const birthDate = 'aaa';
        const sex = Sex.F;
        const email = 'bbb';

        let julie = new RegistrationBuilder()
            .setFirstName(firstName)
            .setLastName(lastName)
            .setBirthDate(birthDate)
            .setSex(sex)
            .setEmail(email)
            .build();

        let user = await dao.create(julie);
        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, lastName);
        assert.equal(user.sex, sex);
        assert.equal(user.email, email);
        assert.equal(user.birthDate, birthDate);

        let newEmail = 'xx@zz.yy';
        julie.updateEmail(newEmail);
        julie = await dao.update(julie);

        assert.equal(user.firstName, firstName);
        assert.equal(user.lastName, lastName);
        assert.equal(user.sex, sex);
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
    const builder = new RegistrationBuilder();

    let albert = builder
        .setFirstName('Albert')
        .setLastName('Armstrong')
        .setBirthDate('XXX')
        .setSex(Sex.M)
        .setEmail('XXX')
        .build();

    let bob = builder
        .setFirstName('Bob')
        .setLastName('Brooke')
        .setBirthDate('XXX')
        .setSex(Sex.M)
        .setEmail('XXX')
        .build();

    let clara = builder
        .setFirstName('Clara')
        .setLastName('Carson')
        .setBirthDate('XXX')
        .setSex(Sex.F)
        .setEmail('XXX')
        .build();

    await dao.create(albert);
    await dao.create(bob);
    await dao.create(clara);
}