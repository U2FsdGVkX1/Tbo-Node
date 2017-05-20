const util = require('util');
const config = require('../config');
const log = new (require('./log'))();
const telegram = new (require('./telegram'))();

class Error {
    async errorHandler (err) {
        log.error(err);
        telegram.sendMessage(config.master, `花生了一个错误~(￣▽￣~)ε=ε=ε=：\n${err}`);
    }
    async warningHandler (warning) {
        log.warning(warning.message);
        telegram.sendMessage(config.master, `花生了一个警告~(￣▽￣~)ε=ε=ε=：\n${warning}`);
    }
};

module.exports = Error;