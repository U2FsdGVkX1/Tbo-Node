const base = require('../../lib/base');

class hello extends base {
    constructor () {
        super();
        this.log.info("Hello World!");
    }
    async init (data, func, from, chat, date) {

    }
    async command (data, command, param, message_id, from, chat, date) {
        if (command == '/hello') {
            this.telegram.sendMessage(chat.id,'Hello World!',message_id);
        }
    }
    async message (data, message, message_id, from, chat, date) {
        
    }
    async sticker (data, sticker, message_id, from, chat, date) {
        
    }
    async photo (data, photo, caption, message_id, from, chat, date) {
        
    }
    async callback_query (data, callback_data, callback_id, callback_from, message_id, from, chat, date) {
        
    }
    async inline_query (data, query, offset, inline_id, from) {
        
    }
    async new_member (data, new_member, message_id, from, chat, date) {
        
    }
    async left_member (data, left_member, message_id, from, chat, date) {
        
    }
}

module.exports = hello;
