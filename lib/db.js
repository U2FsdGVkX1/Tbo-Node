const config = require('../config');
const modee = require('modee');
const db = new modee(config.db);
db.connect();

module.exports = db;