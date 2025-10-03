import { alterToSQL } from './alter.js'
import { analyzeToSQL, attachToSQL } from './analyze.js'
import { createToSQL } from './create.js'
import { commentOnToSQL } from './comment.js'
import { explainToSQL } from './explain.js'
import { selectToSQL } from './select.js'
import { deleteToSQL } from './delete.js'
import { updateToSQL } from './update.js'
import { insertToSQL } from './insert.js'
import {
  callToSQL,
  commonCmdToSQL,
  deallocateToSQL,
  declareToSQL,
  descToSQL,
  executeToSQL,
  forLoopToSQL,
  grantAndRevokeToSQL,
  ifToSQL,
  useToSQL,
  raiseToSQL,
  renameToSQL,
  setVarToSQL,
  lockUnlockToSQL,
} from './command.js'
import { execToSQL } from './exec.js'
import { orderOrPartitionByToSQL } from './expr.js'
import { limitToSQL } from './limit.js'
import { loadDataToSQL } from './load.js'
import { procToSQL } from './proc.js'
import { transactionToSQL } from './transaction.js'
import { showToSQL } from './show.js'
import { hasVal, toUpper } from './util.js'

const typeToSQLFn = {
  alter       : alterToSQL,
  analyze     : analyzeToSQL,
  attach      : attachToSQL,
  create      : createToSQL,
  comment     : commentOnToSQL,
  select      : selectToSQL,
  deallocate  : deallocateToSQL,
  delete      : deleteToSQL,
  exec        : execToSQL,
  execute     : executeToSQL,
  explain     : explainToSQL,
  for         : forLoopToSQL,
  update      : updateToSQL,
  if          : ifToSQL,
  insert      : insertToSQL,
  load_data   : loadDataToSQL,
  drop        : commonCmdToSQL,
  truncate    : commonCmdToSQL,
  replace     : insertToSQL,
  declare     : declareToSQL,
  use         : useToSQL,
  rename      : renameToSQL,
  call        : callToSQL,
  desc        : descToSQL,
  set         : setVarToSQL,
  lock        : lockUnlockToSQL,
  unlock      : lockUnlockToSQL,
  show        : showToSQL,
  grant       : grantAndRevokeToSQL,
  revoke      : grantAndRevokeToSQL,
  proc        : procToSQL,
  raise       : raiseToSQL,
  transaction : transactionToSQL,
}

function unionToSQL(stmt) {
  if (!stmt) return ''
  const fun = typeToSQLFn[stmt.type]
  const { _parentheses, _orderby, _limit } = stmt
  const res = [_parentheses && '(', fun(stmt)]
  while (stmt._next) {
    const nextFun = typeToSQLFn[stmt._next.type]
    const unionKeyword = toUpper(stmt.set_op)
    res.push(unionKeyword, nextFun(stmt._next))
    stmt = stmt._next
  }
  res.push(_parentheses && ')', orderOrPartitionByToSQL(_orderby, 'order by'), limitToSQL(_limit))
  return res.filter(hasVal).join(' ')
}

function multipleToSQL(stmt) {
  const res = []
  for (let i = 0, len = stmt.length; i < len; ++i) {
    const astInfo = stmt[i] && stmt[i].ast ? stmt[i].ast : stmt[i]
    let sql = unionToSQL(astInfo)
    if (i === len - 1 && astInfo.type === 'transaction') sql = `${sql} ;`
    res.push(sql)
  }
  return res.join(' ; ')
}

export {
  unionToSQL,
  multipleToSQL,
}
