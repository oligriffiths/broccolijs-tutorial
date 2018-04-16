const Funnel = require("broccoli-funnel");
const Merge = require("broccoli-merge-trees");
const EsLint = require("broccoli-lint-eslint");
const SassLint = require("broccoli-sass-lint");
const CompileSass = require("broccoli-sass-source-maps");
const Rollup = require("broccoli-rollup");
const LiveReload = require('broccoli-livereload');
const log = require('broccoli-stew').log;
const debug = require('broccoli-stew').debug;
const babel = require("rollup-plugin-babel");
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const appRoot = "app";

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files: ["index.html"],
  annotation: "Index file",
});

// Lint js files
let js = new EsLint(appRoot, {
  persist: true
});

// Compile JS through rollup
js = new Rollup(js, {
  inputFiles: ["**/*.js"],
  annotation: "JS Transformation",
  rollup: {
    input: "app.js",
    output: {
      file: "assets/app.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      babel({
        exclude: "node_modules/**",
      }),
    ],
  }
});

// Lint css files
let css = new SassLint(appRoot + '/styles', {
  disableTestGenerator: true,
});

// Copy CSS file into assets
css = new CompileSass(
  [css],
  "app.scss",
  "assets/app.css",
  {
    sourceMap: true,
    sourceMapContents: true,
    annotation: "Sass files"
  }
);

// Copy public files into destination
const public = new Funnel("public", {
  annotation: "Public files",
});

// Remove the existing module.exports and replace with:
let tree = new Merge([html, js, css, public], {annotation: "Final output"});

// Log the output tree
tree = log(tree, {
  output: 'tree',
});

// Include live reaload server
tree = new LiveReload(tree, {
  target: 'index.html',
});

module.exports = tree;
