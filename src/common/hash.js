'use strict';

const bcrypt = require('bcrypt');

const salt = bcrypt.genSaltSync(10);

exports.hashSync = function hashSync(plainText) {
    return bcrypt.hashSync(plainText, salt);
};

exports.compareSync = function compareSync(plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
};