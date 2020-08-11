'use strict';

const assert = require('assert');
const hash = require('./hash.js');

describe('test hash', () => { 

    it('when password is ok', () => {
        
        const testPsw = 'ABCD';

        const hashPsw = hash.hashSync(testPsw);

        assert.ok(hash.compareSync(testPsw, hashPsw));
    })

    it('when password is not ok', () => {
        
        const testPsw = 'ABCD';
        const badPsw = 'ABCDE';

        const hashPsw = hash.hashSync(testPsw);

        assert.ok(!hash.compareSync(testPsw, badPsw));
    })
})
