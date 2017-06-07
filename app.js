const error = new (require('./lib/error'))();
const log = new (require('./lib/log'))();
const core = new (require('./core'))();

log.info('正在初始化 Tbo', 'SYSTEM');
process.on('uncaughtException', error.errorHandler);
process.on('unhandledRejection', error.errorHandler);
process.on('warning', error.warningHandler);

log.info('正在初始化消息', 'SYSTEM');
core.run();