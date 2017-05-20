const util = require('util');

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
    }
    async error (text) {
        const t = new Date();
        console.error(util.format("[%d:%d:%d]\tERROR\t%s", 
        t.getHours(), t.getMinutes(), t.getSeconds(), text));
    }
};

module.exports = Log;