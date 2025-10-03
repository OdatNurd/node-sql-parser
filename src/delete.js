import { columnsToSQL } from './column.js'
import { exprToSQL, orderOrPartitionByToSQL } from './expr.js'
import { limitToSQL } from './limit.js'
import { tablesToSQL } from './tables.js'
import { commonOptionConnector, hasVal, returningToSQL } from './util.js'
import { withToSQL } from './with.js'

function deleteToSQL(stmt) {
  const { columns, from, table, where, orderby, with: withInfo, limit, returning } = stmt
  const clauses = [withToSQL(withInfo), 'DELETE']
  const columnInfo = columnsToSQL(columns, from)
  clauses.push(columnInfo)
  if (Array.isArray(table)) {
    if (!(table.length === 1 && table[0].addition === true)) clauses.push(tablesToSQL(table))
  }
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'))
  clauses.push(limitToSQL(limit))
  clauses.push(returningToSQL(returning))
  return clauses.filter(hasVal).join(' ')
}

export {
  deleteToSQL,
}
