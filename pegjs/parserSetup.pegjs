// Global definitions; this is inserted into the code exactly one time.
{{
  const reservedMap = {
    'ALTER': true,
    'ALL': true,
    'ADD': true,
    'AND': true,
    'AS': true,
    'ASC': true,

    'BETWEEN': true,
    'BY': true,

    'CALL': true,
    'CASE': true,
    'CREATE': true,
    'CONTAINS': true,
    'COUNT': true,
    'CURRENT_DATE': true,
    'CURRENT_TIME': true,
    'CURRENT_TIMESTAMP': true,
    'CURRENT_USER': true,

    'DELETE': true,
    'DESC': true,
    'DISTINCT': true,
    'DROP': true,

    'ELSE': true,
    'END': true,
    'EXISTS': true,
    'EXPLAIN': true,

    'FALSE': true,
    'FROM': true,
    'FULL': true,

    'GROUP': true,

    'HAVING': true,

    'IN': true,
    'INNER': true,
    'INSERT': true,
    'INTO': true,
    'IS': true,

    'JOIN': true,
    // 'JSON': true,

    // 'KEY': true,

    'LEFT': true,
    'LIKE': true,
    'LIMIT': true,
    'LOW_PRIORITY': true, // for lock table

    'NOT': true,
    'NULL': true,

    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

    'RECURSIVE': true,
    'RENAME': true,
    'READ': true, // for lock table
    'RIGHT': true,

    'SELECT': true,
    'SESSION_USER': true,
    'SET': true,
    'SHOW': true,
    'SYSTEM_USER': true,

    'TABLE': true,
    'THEN': true,
    'TRUE': true,
    'TRUNCATE': true,
    // 'TYPE': true,   // reserved (MySQL)

    'UNION': true,
    'UPDATE': true,
    'USING': true,

    'VALUES': true,

    'WITH': true,
    'WHEN': true,
    'WHERE': true,
    'WRITE': true, // for lock table

    'GLOBAL': true,
    'SESSION': true,
    'LOCAL': true,
    'PERSIST': true,
    'PERSIST_ONLY': true,
  };

  const cmpPrefixMap = {
    '+': true,
    '-': true,
    '*': true,
    '/': true,
    '>': true,
    '<': true,
    '!': true,
    '=': true,

    //between
    'B': true,
    'b': true,
    //for is or in
    'I': true,
    'i': true,
    //for like
    'L': true,
    'l': true,
    //for not
    'N': true,
    'n': true
  };

  function createUnaryExpr(op, e) {
    return {
      type: 'unary_expr',
      operator: op,
      expr: e
    };
  }

  function createBinaryExpr(op, left, right) {
    return {
      type: 'binary_expr',
      operator: op,
      left: left,
      right: right
    };
  }

  function isBigInt(numberStr) {
    const previousMaxSafe = BigInt(Number.MAX_SAFE_INTEGER)
    const num = BigInt(numberStr)
    if (num < previousMaxSafe) return false
    return true
  }

  function createList(head, tail, po = 3) {
    const result = [head];
    for (let i = 0; i < tail.length; i++) {
      delete tail[i][po].tableList
      delete tail[i][po].columnList
      result.push(tail[i][po]);
    }
    return result;
  }

  function createBinaryExprChain(head, tail) {
    let result = head;
    for (let i = 0; i < tail.length; i++) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3]);
    }
    return result;
  }
}}

// Per-Parse configuration; this gets injected directly into the parser itself
// and gets executed every time the parser parses something.
{
  function getLocationObject() {
    return options.includeLocations ? { loc: location() } : {};
  }

  function queryTableAlias(tableName) {
    const alias = tableAlias[tableName];
    if (alias) {
      return alias;
    }
    if (tableName) {
      return tableName;
    }
    return null;
  }

  function columnListTableAlias(columnList) {
    const newColumnsList = new Set()
    const symbolChar = '::'
    for(let column of columnList.keys()) {
      const columnInfo = column.split(symbolChar)
      if (!columnInfo) {
        newColumnsList.add(column)
        break
      }
      if (columnInfo && columnInfo[1]) columnInfo[1] = queryTableAlias(columnInfo[1])
      newColumnsList.add(columnInfo.join(symbolChar))
    }
    return Array.from(newColumnsList)
  }

  function refreshColumnList(columnList) {
    const columns = columnListTableAlias(columnList)
    columnList.clear()
    columns.forEach(col => columnList.add(col))
  }

  // used for dependency analysis
  let varList = [];

  const tableList = new Set();
  const columnList = new Set();
  const tableAlias = {};
}

// As the entrypoint to the grammar, capture zero or more statements and
// return them. Any amount of whitespace is allowed to surround the statements.
start
  = __ stmts:(multiple_stmt) { return stmts; }