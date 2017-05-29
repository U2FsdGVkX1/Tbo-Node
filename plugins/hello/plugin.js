const base = require('../../lib/base');

class hello extends base {
    constructor () {
        super();
        this.log.info("Hello World!");
    }
    async init (data, func, from, chat, date) {

    }
    async message (data, message, message_id, from, chat, date) {
        
    }
}

module.exports = hello;
