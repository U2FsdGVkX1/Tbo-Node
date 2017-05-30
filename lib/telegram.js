const util = require('util');
const request = require('superagent');
const config = require('../config');
const log = new (require('./log'))();

class Telegram {
    constructor (token = null) {
        if (token) {
            this.token = token;
        } else {
            this.token = config.bot.token;
        }
    }
    async callMethod (method, param = {}, detection = true) {
        var ret;
        const url = 'https://api.telegram.org/bot' + this.token + '/' + method;
        try {
            ret = (await request.post(url)
                                      .accept("json")
                                      .send(param)
                                      .then())
                                      .body;
        } catch (err) {
            if (typeof err.response == 'undefined') {
                ret = err.stack;
            } else {
                ret = err.response.body;
            }
            if (detection == true) {
                let str = "尝试调用 " +
                          method +
                          " 时出现问题，参数表如下：\n" +
                          JSON.stringify(param) +
                          "\n返回结果：\n" +
                          JSON.stringify(ret);
                log.error(str);
            }
        }
        return ret;
    }
    async getUpdates (offset = undefined, limit = undefined, timeout = undefined, allowed_updates = undefined) {
        var ret = await this.callMethod ('getUpdates', {
            'offset': offset,
            'limit': limit,
            'timeout': timeout,
            'allowed_updates': allowed_updates
        });
        return [ret];
    }
    async sendMessage (chat_id, text, reply_to_message_id = undefined, reply_markup = undefined, parse_mode = 'HTML') {
        // reply_markup = []
        log.info(util.format("发送 %s 到 %d", text, chat_id), 'Telegram');
        var ret = await this.callMethod ('sendMessage', {
            'chat_id': chat_id,
            'text': text,
            'reply_to_message_id': reply_to_message_id,
            'parse_mode': parse_mode,
            'reply_markup': reply_markup
        });
        return [ret, ret.result.message_id];
    }
    async editMessage (chat_id, message_id, text, reply_markup = undefined, parse_mode = 'HTML') {
        // reply_markup = []
        log.info(util.format("在 %d 编辑消息 %s", chat_id, text), 'Telegram');
        var ret = await this.callMethod ('editMessageText', {
            'chat_id': chat_id,
            'message_id': message_id,
            'text': text,
            'parse_mode': parse_mode,
            'reply_markup': reply_markup
        });
        return [ret, ret.result.message_id];
    }
    async deleteMessage (chat_id, message_id) {
        log.info(util.format("删除 %s 的消息 %d", chat_id, message_id), 'Telegram');
        var ret = await this.callMethod('deleteMessage', {
            'chat_id': chat_id,
            'message_id': message_id
        })

        return [ret];
    }
    async sendPhoto (chat_id, photo, caption = '', reply_to_message_id = undefined, reply_markup = undefined) {
        // reply_markup = []
        log.info(util.format("发送图片 %s 到 %d", photo, chat_id), 'Telegram');
        var ret = await this.callMethod ('sendPhoto', {
            'chat_id': chat_id,
            'photo': photo,
            'caption': caption,
            'reply_to_message_id': reply_to_message_id,
            'reply_markup': reply_markup
        });
        return [ret, ret.result.message_id];
    }
    async sendAudio (chat_id, audio, caption = '', reply_to_message_id = undefined, reply_markup = undefined) {
        // reply_markup = []
        log.info(util.format("发送语音 %s 到 %d", audio, chat_id), 'Telegram');
        var ret = await this.callMethod ('sendAudio', {
            'chat_id': chat_id,
            'audio': audio,
            'caption': caption,
            'reply_to_message_id': reply_to_message_id,
            'reply_markup': reply_markup
        });
        return [ret, ret.result.message_id];
    }
    async sendDocument (chat_id, document, caption = '', reply_to_message_id = undefined, reply_markup = undefined) {
        // reply_markup = []
        log.info(util.format("发送文件 %s 到 %d", document, chat_id), 'Telegram');
        var ret = await this.callMethod ('sendDocument', {
            'chat_id': chat_id,
            'document': document,
            'caption': caption,
            'reply_to_message_id': reply_to_message_id,
            'reply_markup': reply_markup
        });
        return [ret, ret.result.message_id];
    }
    async answerCallback (callback_id, text = '', show_alert = false, $url = '', cache_time = 0) {
        log.info(util.format("回应 callback %s", callback_id), 'Telegram');
        var ret = await this.callMethod ('answerCallbackQuery', {
            'callback_query_id': callback_id,
            'text': text,
            'show_alert': show_alert,
            'url': url,
            'cache_time': cache_time
        });
        return [ret];
    }
    async getMe () {
        var ret = await this.callMethod ('getMe', {
        });
        return [ret];
    }
    async getChatAdmin (chat_id) {
        var ret = await this.callMethod ('getChatAdministrators', {
            'chat_id': chat_id
        });
        return [ret];
    }
    async isAdmin (chat_id, user_id) {
        var ret = false;
        var [adminList] = await this.getChatAdmin (chat_id);
        for (var i in adminList.result) {
            if (adminList.result[i].user.id == user_id) {
                ret = true;
                break;
            }
        }
        return ret;
    }
    
};

module.exports = Telegram;
