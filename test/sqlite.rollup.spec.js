const Module = require('module');
const { Parser } = require('../sqlite.js');

console.log('--- ESM TEST: Loaded Parser from sqlite.js ---\n', Parser.toString());

// Get a reference to the original require function
const originalRequire = Module.prototype.require;

// Override the require function
Module.prototype.require = function(request) {
  // If the test file is trying to load the original parser...
  if (request === '../src/parser') {
    // ...return our Rollup-built Parser class instead.
    // The original test expects the module to have a `default` export.
    return { default: Parser };
  }

  // For all other require calls, use the original function
  return originalRequire.apply(this, arguments);
};

// Now that the patch is in place, load and execute the original test file.
// It will run all of its tests, but it will be testing the new parser.
require('./sqlite.spec.js');

// Restore the original require function to avoid side-effects
Module.prototype.require = originalRequire;