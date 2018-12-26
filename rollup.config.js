/* eslint-env node */

import alias from "rollup-plugin-alias";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

export default {
  //  entry: 'src/main.js',
  plugins: [
    alias({
      assert: `${process.cwd()}/src/shims/assert.js`
    }),
    // Resolve external modules as part of the tree-shaking bundling.
    resolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: true
    }),
    // Enable loading commonjs modules by converting them into ES& modules.
    commonjs({
      include: "node_modules/**"
    }),
    // Pass through babel (and transpile nanohtml into js code at build time)
    babel({
      // only transpile our source code
      exclude: "node_modules/**"
    })
  ],
  output: {
    format: "iife"
  }
};
