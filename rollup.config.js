import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import customPeggyPlugin from './rollup-plugin-peggy.js'; // Import our new plugin

export default {
  input: 'index.js',
  output: {
    file: 'output/sql-parser.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    customPeggyPlugin({
      grammars: {
        // This key is the "virtual" file we will import in our source code.
        'sqlite.pegjs': {
          // This is the ordered list of partial files to combine in memory.
          files: [
            'pegjs/parserSetup.pegjs',
            'pegjs/sqlite.pegjs',
          ],
          // These options are passed directly to peggy.generate() for this grammar.
          options: {
            dependencies: {
              'BigInt': 'big-integer',
            },
          },
        },
      },
    }),
    resolve(),
    commonjs(),
  ],
};
