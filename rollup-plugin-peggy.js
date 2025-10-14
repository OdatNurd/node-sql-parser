import peggy from 'peggy';
import path from 'path';
import fs from 'fs';

export default function customPeggyPlugin(options = {}) {
  const { grammars = {} } = options;
  const grammarFiles = Object.keys(grammars);

  return {
    name: 'custom-peggy',

    transform(code, id) {
      // Check if the file being imported is one of the grammars we're configured to build.
      const matchingGrammarKey = grammarFiles.find(key => id.endsWith(key));

      if (matchingGrammarKey === undefined) {
        return null; // If not, this plugin does nothing.
      }

      // Get the configuration for this specific grammar.
      const grammarConfig = grammars[matchingGrammarKey];
      const partialFiles = grammarConfig.files || [];
      const peggyOptions = grammarConfig.options || {};

      // Create the array of source objects for Peggy. This is what enables
      // accurate error reporting.
      const sources = partialFiles.map(file => {
        const filePath = path.resolve(file);
        if (fs.existsSync(filePath) === false) {
          this.error(`Partial grammar file not found: ${filePath}`);
        }
        return {
          source: filePath,
          text: fs.readFileSync(filePath, 'utf8'),
        };
      });

      // Generate the parser from the array of sources.
      try {
        const parserSource = peggy.generate(sources, {
          ...peggyOptions,
          output: 'source',
          format: 'es',
        });

        return {
          code: parserSource,
          map: { mappings: '' }, // A null sourcemap is fine here.
        };
      } catch (e) {
        // If Peggy throws an error, we forward it to Rollup so the build
        // fails with a clear, actionable message.
        this.error({
          message: `Peggy Error: ${e.message}`,
          loc: e.location,
        });
      }
    },
  };
}
