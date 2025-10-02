const sqliteParser = require('../build/sqlite.js');

module.exports = {
  sqlite: (sql, opt) => sqliteParser.parse(sql, opt)
};