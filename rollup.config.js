import { createFilter } from '@rollup/pluginutils';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peggy from 'peggy';
import path from 'path';

/**
 * Custom Rollup plugin to compile .pegjs files into pure ES modules.
 */
function customPeggyPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'custom-peggy',
    transform(code, id) {
      if (!id.endsWith('.pegjs') || !filter(id)) {
        return null;
      }

      // Use peggy to generate an ES module directly
      const parserSource = peggy.generate(code, {
        output: 'source',
        format: 'es',
        dependencies: options.dependencies || {},
      });

      return {
        code: parserSource,
        map: { mappings: '' },
      };
    },
  };
}

export default {
  input: 'index.js',
  output: {
    file: 'output/sql-parser.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    customPeggyPlugin({
      include: '**/*.pegjs',
      dependencies: {
        'BigInt': 'big-integer',
      },
    }),
    resolve(),
    commonjs(),
  ],
};