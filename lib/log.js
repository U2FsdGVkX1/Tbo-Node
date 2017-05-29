const util = require('util');
const request = require('superagent');
const config = require('../config');

class Log {
    async info (text) {
        const t = new Date();
        console.info(util.format("[%d:%d:%d]\tINFO\t%s", 
        t.getHours(), t.getMinutes(), t.getSeconds(), text));
    }
    async warning (text) {
        const t = new Date();
        console.error(util.format("[%d:%d:%d]\tWARN\t%s", 
        t.getHours(), t.getMinutes(), t.getSeconds(), text));
        this.send(config.master, '[WARNING]' + text);
    }
    async error (text) {
        const t = new Date();
        console.error(util.format("[%d:%d:%d]\tERROR\t%s", 
        t.getHours(), t.getMinutes(), t.getSeconds(), text));
        this.send(config.master, '[ERROR]' + text);
    }
    async send (chat_id, text) {
        if (config.debug) {
            const url = 'https://api.telegram.org/bot' + config.bot.token + '/sendMessage',
                  param = {
                      'chat_id': chat_id,
                      'text': text
                  };
            request.post(url).accept("json").send(param).end();
        }
    }
};

module.exports = Log;