const base = require('../../lib/base');

class hello extends base {
    constructor () {
        super();
        this.log.info("Hello World!");
    }
    async init (data, func, from, chat, date) {

    }
    async message (data, message, message_id, from, chat, date) {
        this.telegram.sendMessage(from.id, '你吼', message_id);
    }
}

module.exports = hello;
