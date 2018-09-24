// Plugins
const funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const compileSass = require('broccoli-sass-source-maps')(require('sass'));
const esLint = require("broccoli-lint-eslint");
const sassLint = require("broccoli-sass-lint");
const Rollup = require("broccoli-rollup");
const LiveReload = require('broccoli-livereload');
const CleanCss = require('broccoli-clean-css');
const log = require('broccoli-stew').log;
const assetRev = require('broccoli-asset-rev');
const broccoliGlimmer = require('./lib/broccoli-glimmer');
const debug = require('broccoli-stew').debug;

// Rollup plugins
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify').uglify;

// Environment and config
const env = require('broccoli-env').getEnv() || 'development';
const package = require('./package.json');
const isProduction = env === 'production';

// Status
console.log('Application: ' + package.name);
console.log('Environment: ' + env);

// Build config
const appRoot = "src";

// Lint the source JS files
let jsTree = esLint(appRoot, {
  persist: true
});

// Build the glimmer tree, this returns the compiled templates, resolver configuration and data-segment.js
const glimmerTree = broccoliGlimmer(jsTree);

// Compile JS through rollup
const rollupPlugins = [
  nodeResolve({
    jsnext: true,
    browser: true,
  }),
  commonjs({
    include: 'node_modules/**',
  }),
  babel({
    exclude: 'node_modules/**',
  }),
];

// Uglify the output for production
if (isProduction) {
  rollupPlugins.push(uglify());
}

// Run through rollup
jsTree = new Rollup(glimmerTree, {
  inputFiles: ['**/*.js'],
  rollup: {
    input: 'src/index.js',
    output: {
      file: 'assets/app.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    plugins: rollupPlugins,
  }
});

// Lint css files
let cssTree = sassLint(appRoot + '/styles', {
  disableTestGenerator: true,
});

// Copy CSS file into assets
cssTree = compileSass(
  [cssTree],
  'app.scss',
  'assets/app.css',
  {
    sourceMap: !isProduction,
    sourceMapContents: true,
    annotation: "Sass files"
  }
);

// Compress our CSS
if (isProduction) {
  cssTree = new CleanCss(cssTree);
}

// Copy public files into destination
const publicTree = funnel('public', {
  annotation: "Public files",
});

// Copy HTML file from app root to destination
const htmlTree = funnel(appRoot, {
  srcDir: 'ui',
  files: ["index.html"],
  destDir: '/',
  annotation: "Index file",
});

// Filter the templates
const templatesTree = funnel(glimmerTree, {
  files: ['templates.gbx'],
});

// Merge all the trees together
let tree = merge([htmlTree, jsTree, cssTree, publicTree, templatesTree], {annotation: "Final output"});

// Include asset hashes
if (isProduction) {
  tree = assetRev(tree);
} else {
  // Log the output tree
  tree = log(tree, {
    output: 'tree',
  });

  tree = new LiveReload(tree, {
    target: 'index.html',
  });
}

module.exports = tree;
