import { toUpper, hasVal } from './util.js'
import { exprToSQL } from './expr.js'

function intervalToSQL(intervalExpr) {
  const { expr, unit, suffix } = intervalExpr
  const result = ['INTERVAL', exprToSQL(expr), toUpper(unit), exprToSQL(suffix)]
  return result.filter(hasVal).join(' ')
}

export {
  intervalToSQL,
}
