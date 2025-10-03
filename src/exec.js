import { exprToSQL } from './expr.js'
import { tableToSQL } from './tables.js'
import { hasVal, toUpper } from './util.js'

function execVariablesToSQL(stmt) {
  const { name, value } = stmt
  const result = [`@${name}`, '=', exprToSQL(value)]
  return result.filter(hasVal).join(' ')
}

function execToSQL(stmt) {
  const { keyword, module, parameters } = stmt
  const result = [
    toUpper(keyword),
    tableToSQL(module),
    (parameters || []).map(execVariablesToSQL).filter(hasVal).join(', '),
  ]
  return result.filter(hasVal).join(' ')
}

export {
  execToSQL,
}
