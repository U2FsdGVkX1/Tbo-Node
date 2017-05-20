class Base {
    constructor () {
        this.db = require('./db');
        this.log = new (require('./log'))();
        this.telegram = new (require('./telegram'))();
    }
};

module.exports = Base;