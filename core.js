const fs = require('fs');
const util = require('util');
const config = require('./config');
const db = require('./lib/db');
const log = new (require('./lib/log'))();
const telegram = new (require('./lib/telegram'))();


class Core {
    async run () {
        log.info('正在扫描插件', 'SYSTEM');
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

        log.info('正在初始化插件', 'SYSTEM');
        plugins.forEach((value, index, array) => {
            array[index].object = new (require(value.path))()
            log.info("插件已加载完成", value.pcn);
        }, this);
        log.info(util.format("已加载 %d 个插件", plugins.length), 'SYSTEM');

        log.info('初始化完成', 'SYSTEM');
        var data, offset = 0;
        while (true) {
            [data] = await telegram.getUpdates(offset, 100, 3600);
            if (typeof data.result == 'undefined') {
                log.error(util.format("getUpdates 不知道怎么就 boom 了，建议排查网络：%s", data), 'SYSTEM');
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
                                    if (param[5].id < 0)
                                        log.info(util.format("[%s]『%s』: %s", param[5].title, param[4].first_name, param[0].message.text), 'Command');
                                    else
                                        log.info(util.format("[Private]『%s』: %s", param[4].first_name, param[0].message.text), 'Command');
                                    break;

                                case 'message':
                                    if (param[4].id < 0)
                                        log.info(util.format("[%s]『%s』: %s", param[4].title, param[3].first_name, param[1]), 'Message');
                                    else
                                        log.info(util.format("[Private]『%s』: %s", param[3].first_name, param[1]), 'Message');
                                    break;

                                case 'sticker':
                                    let emoji = '🐸 ';
                                    if (typeof param[1].emoji != 'undefined')
                                        emoji = param[1].emoji + ' ';

                                    if (param[4].id < 0)
                                        log.info(util.format("[%s]『%s』: %s[Sticker]", param[4].title, param[3].first_name, emoji), 'Sticker');
                                    else
                                        log.info(util.format("[Private]『%s』: %s[Sticker]", param[3].first_name, emoji), 'Sticker');
                                    break;

                                case 'photo':
                                    let caption = '';
                                    if (param[2] != '')
                                        caption = ', ' + param[2];
                                    
                                    if (param[5].id < 0)
                                        log.info(util.format("[%s]『%s』: [Photo]%s", param[5].title, param[4].first_name, caption), 'Photo');
                                    else
                                        log.info(util.format("[Private]『%s』: [Photo]%s", param[4].first_name, caption), 'Photo');
                                    break;
                                case 'voice':
                                    if (param[5].id < 0)
                                        log.info(util.format("[%s]『%s』: [Voice]", param[5].title, param[4].first_name), 'Voice');
                                    else
                                        log.info(util.format("[Private]『%s』: [Voice]", param[4].first_name), 'Voice');
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
            } else if (typeof data.message.sticker != 'undefined') {
                func = 'sticker';
                param = [
                    data.message.sticker,
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
            } else if (typeof data.message.photo != 'undefined') {
                let caption = '';
                if (typeof data.message.caption != 'undefined') {
                    caption = data.message.caption;
                }

                func = 'photo';
                param = [
                    data.message.photo,
                    caption,
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
            } else if (typeof data.message.voice != 'undefined') {
                func = 'voice';
                param = [
                    data.message.voice,
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
            initParam.unshift(data);
        }

        return [func, param, initParam];
    }
};

module.exports = Core;
