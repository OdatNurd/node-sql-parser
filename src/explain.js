import { selectToSQL } from './select.js'
import { toUpper } from './util.js'

function explainToSQL(stmt) {
  const { type, expr } = stmt
  return [toUpper(type), selectToSQL(expr)].join(' ')
}

export {
  explainToSQL,
}
