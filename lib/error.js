const log = new (require('./log'))();

class Error {
    async errorHandler (err) {
        log.error(err, 'SYSTEM');
    }
    async warningHandler (warning) {
        log.warning(warning.message, 'SYSTEM');
    }
};

module.exports = Error;