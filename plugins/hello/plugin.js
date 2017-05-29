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
    async command (data, command, param, message_id, from, chat, date) {
        if (command == '/hello') {
            this.telegram.sendMessage(chat.id,'Hello World!',message_id);
        }
    }
}

module.exports = hello;
