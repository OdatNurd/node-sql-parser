const fs = require('fs')
const path = require('path')
const peggy = require('peggy')

const parserFolder = path.join(__dirname, 'pegjs')
const buildDir = path.join(__dirname, 'build')
const PARSER_FILE = /(.*)\.pegjs$/

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

fs.readdirSync(parserFolder)
  .filter(file => PARSER_FILE.test(file))
  .forEach(file => {
    const [, name] = file.match(PARSER_FILE)
    const source = fs.readFileSync(path.join(parserFolder, file), 'utf8')
    const parser = peggy.generate(source, {
      format: 'umd',
      output: 'source',
      dependencies: {
        "BigInt": "big-integer",
      },
    })
    fs.writeFileSync(path.join(__dirname, `build/${name}.js`), parser)
  })