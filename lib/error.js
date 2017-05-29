const log = new (require('./log'))();

class Error {
    async errorHandler (err) {
        log.error(err);
    }
    async warningHandler (warning) {
        log.warning(warning.message);
    }
};

module.exports = Error;