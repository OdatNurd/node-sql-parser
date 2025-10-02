import parser from '../build/sqlite.js'

export default {
  [PARSER_NAME]: (sql, opt) => parser.parse(sql, opt),
}