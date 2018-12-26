/* eslint-env node */

const presets = [
  [
    "@babel/env",
    {
      targets: {
        firefox: "64"
      },
      useBuiltIns: "usage"
    }
  ]
];

const plugins = [
  [
    "module:nanohtml",
    {
      useImport: true
    }
  ]
];

module.exports = {
  presets,
  plugins
};
