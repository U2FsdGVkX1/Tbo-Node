const fs = require('fs');
const util = require('util');
const config = require('./config');
const db = require('./lib/db');
const log = new (require('./lib/log'))();
const telegram = new (require('./lib/telegram'))();

class Core {
    async run () {
        log.info('正在扫描插件');
        var plugins = fs.readdirSync('./plugins');
        plugins = plugins.map(value => {
            return {
                pcn: value,
                path: './plugins/' + value + '/plugin.js'
            };
        });
        plugins = plugins.filter(value => {
            return fs.existsSync(value.path);
        });

        log.info('正在初始化插件');
        plugins.forEach((value, index, array) => {
            array[index].object = new (require(value.path))()
        }, this);
        
        log.info('初始化完成');
        var data, offset = 0;
        while (true) {
            [data] = await telegram.getUpdates(offset, 100, 3600);
            if (typeof data.result == 'undefined') {
                log.error(util.format("getUpdates 不知道怎么就 boom 了，建议排查网络：%s", data));
                break;
            }
            
            if (data.result.length) {
                data = data.result;
                offset = data[data.length - 1].update_id + 1;

                data.forEach ((value, index) => {
                    this.parse(value).then(tmp => {
                        const [func, param, initParam] = tmp;
                        if (typeof func != 'undefined') {
                            switch (func) {
                                case 'command':
                                    log.info(util.format("收到一条命令 %s", param[1]));
                                    break;
                                case 'message':
                                    log.info(util.format("收到一条消息 %s", param[1]));
                                    break;
                            }
                            plugins.forEach((value, index, array) => {
                                if (typeof value.object.init != 'undefined') {
                                    value.object.init.apply(value.object, initParam);
                                }
                                if (typeof eval('value.object.' + func) != 'undefined') {
                                    eval('value.object.' + func).apply(value.object, param);
                                }
                            }, this);
                        }
                    });
                }, this);
            }
        }
    }
    async parse (data)
    {
        var func, param, initParam;
        if (typeof data.message != 'undefined') {
            if (typeof data.message.text != 'undefined') {
                if (data.message.text[0] == '/') {
                    let messageExplode = data.message.text.split(' ');
                    let commandExplode = messageExplode[0].split('@');
                    if (typeof commandExplode[1] != 'undefined' &&
                        commandExplode[1] != config.bot.name) {
                        
                        return [];
                    }
                    
                    func = 'command';
                    param = [
                        commandExplode[0],
                        messageExplode.slice(1),
                        data.message.message_id,
                        data.message.from,
                        data.message.chat,
                        data.message.date,
                    ];
                    initParam = [
                        func,
                        data.message.from,
                        data.message.chat,
                        data.message.date,
                    ];
                } else {
                    func = 'message';
                    param = [
                        data.message.text,
                        data.message.message_id,
                        data.message.from,
                        data.message.chat,
                        data.message.date,
                    ];
                    initParam = [
                        func,
                        data.message.from,
                        data.message.chat,
                        data.message.date,
                    ];
                }
            } else if (typeof data.message.new_chat_member != 'undefined') {
                func = 'new_member';
                param = [
                    data.message.new_chat_member,
                    data.message.message_id,
                    data.message.from,
                    data.message.chat,
                    data.message.date,
                ];
                initParam = [
                    func,
                    data.message.from,
                    data.message.chat,
                    data.message.date,
                ];
            } else if (typeof data.message.left_chat_member != 'undefined') {
                func = 'left_member';
                param = [
                    data.message.left_chat_member,
                    data.message.message_id,
                    data.message.from,
                    data.message.chat,
                    data.message.date,
                ];
                initParam = [
                    func,
                    data.message.from,
                    data.message.chat,
                    data.message.date,
                ];
            }
        } else if (typeof data.callback_query != 'undefined') {
            if (typeof data.callback_query.data != 'undefined') {
                func = 'callback_query';
                param = [
                    data.callback_query.data,
                    data.callback_query.id,
                    data.callback_query.from,
                    data.callback_query.message.message_id,
                    data.callback_query.message.from,
                    data.callback_query.message.chat,
                    data.callback_query.message.date
                ];
                initParam = [
                    func,
                    data.callback_query.from,
                    data.callback_query.message.chat,
                    data.callback_query.message.date
                ];
            } else if (typeof data.callback_query.game_short_name != 'undefined') {
                func = 'callback_game';
                param = [
                    data.callback_query.game_short_name,
                    data.callback_query.id,
                    data.callback_query.from
                ];
                initParam = [
                    func,
                    data.callback_query.from,
                    data.callback_query.from,
                    new Date().getTime()
                ];
            }
        } else if (typeof data.inline_query != 'undefined') {
            func = 'inline_query';
            param = [
                data.inline_query.query,
                data.inline_query.offset,
                data.inline_query.id,
                data.inline_query.from
            ];
            initParam = [
                func,
                data.inline_query.from,
                data.inline_query.from,
                new Date().getTime()
            ];
        }
        if (typeof func != 'undefined') {
            param.unshift(data);
        }

        return [func, param, initParam];
    }
};

module.exports = Core;
