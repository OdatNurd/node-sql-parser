import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import peg from 'pegjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createFilter } from '@rollup/pluginutils';

// Recreate __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version from package.json and commit hash from git
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));
const version = pkg.version;
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildDate = new Date().toISOString();
const buildVersion = `${version}-${commitHash}`;

/**
 * Custom Rollup plugin to compile .pegjs files into pure ES modules.
 */
function customPegjsPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'custom-pegjs',
    transform(code, id) {
      if (!id.endsWith('.pegjs') || !filter(id)) {
        return null;
      }

      let parserSource = peg.generate(code, {
        output: 'source',
        format: 'commonjs',
      });

      parserSource = parserSource.replace(
        /module\.exports = {[\s\S]*};/,
        "export { peg$SyntaxError as SyntaxError, peg$parse as parse };"
      );

      const deps = options.dependencies || {};
      const depString = Object.keys(deps).map(key =>
        `import ${key} from ${JSON.stringify(deps[key])};`
      ).join('\n');

      const finalCode = `
        ${depString}
        ${parserSource}
      `;

      return {
        code: finalCode,
        map: { mappings: '' },
      };
    },
  };
}

export default {
  input: 'index.js',
  output: {
    file: 'sqlite.js',
    format: 'esm',
    exports: 'named',
    // Add the version and build date banner to the top of the file
    banner: `// node-sql-parser (sqlite) - v${buildVersion} - ${buildDate}`
  },
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    warn(warning);
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'PARSER_NAME': JSON.stringify('sqlite'),
      }
    }),
    alias({
      entries: [
        {
          find: '../pegjs/mysql.pegjs',
          replacement: path.resolve(__dirname, 'pegjs/sqlite.pegjs')
        },
        {
          find: './parser.all',
          replacement: './parser.single'
        }
      ]
    }),
    customPegjsPlugin({
      include: '**/*.pegjs',
      dependencies: {
        'BigInt': 'big-integer',
      },
    }),
    resolve({
      extensions: ['.js'],
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env'],
    }),
  ]
};