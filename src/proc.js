import { assignToSQL } from './assign.js'
import { exprToSQL } from './expr.js'
import { toUpper } from './util.js'

function returnToSQL(stmt) {
  const { type, expr } = stmt
  return [toUpper(type), exprToSQL(expr)].join(' ')
}

function procToSQL(expr) {
  const { stmt } = expr
  switch (stmt.type) {
    case 'assign':
      return assignToSQL(stmt)
    case 'return':
      return returnToSQL(stmt)
  }
}

export {
  procToSQL,
  returnToSQL,
}
