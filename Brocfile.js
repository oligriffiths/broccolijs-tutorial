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
const GlimmerBundleCompiler = require('@glimmer/app-compiler').GlimmerBundleCompiler;
const UnwatchedDir = require("broccoli-source").UnwatchedDir;
const ResolverConfigurationBuilder = require('@glimmer/resolver-configuration-builder');

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
console.log('Environment: ' + env);

// Build config
const appRoot = "src";
const configRoot = 'config';

// Copy HTML file from app root to destination
const html = funnel(appRoot, {
  srcDir: 'ui',
  files: ["index.html"],
  destDir: '/',
  annotation: "Index file",
});


const configTree = funnel(configRoot, {
  files: ['config.js'],
});

const hbsTree = funnel(appRoot, {
  include: ['**/*.hbs'],
  destDir: appRoot
});

// Lint js files
let jsTree = esLint(appRoot, {
  persist: true
});

jsTree = funnel(jsTree, {
  include: ['**/*.js'],
  destDir: appRoot
});

// Template compiler needs access to root package.json
let pkgJsonTree = new UnwatchedDir('./');
pkgJsonTree = funnel(pkgJsonTree, {
  include: ['package.json']
});

// Get templates and package.json
let templateTree = merge([hbsTree, pkgJsonTree]);

// The bundle compiler generates the compiled templates.gbx binary template and data-segment for the runtime
let compiledTree = new GlimmerBundleCompiler(templateTree, {
  mode: 'module-unification',
  outputFiles: {
    heapFile: 'templates.gbx',
    dataSegment: 'data-segment.js'
  }
});

// Filter the templates
const templatesTree = funnel(compiledTree, {
  files: ['templates.gbx'],
});

// Filter the data segment
const dataSegmentTree = funnel(compiledTree, {
  files: ['data-segment.js'],
});

// I don't know what this does...
const defaultModuleConfiguration = require('./defaultModuleConfig');

// ResolverConfiguration used by glimmer DI, written to /config during build
const resolverConfiguration = new ResolverConfigurationBuilder(configTree, {
  configPath: 'test',
  defaultModulePrefix: package.name,
  defaultModuleConfiguration: defaultModuleConfiguration
});

let js = merge([jsTree, dataSegmentTree, resolverConfiguration], { overwrite: true });

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

js = new Rollup(js, {
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
let css = sassLint(appRoot + '/styles', {
  disableTestGenerator: true,
});

// Copy CSS file into assets
css = compileSass(
  [appRoot],
  'styles/app.scss',
  'assets/app.css',
  {
    sourceMap: !isProduction,
    sourceMapContents: true,
    annotation: "Sass files"
  }
);

// Compress our CSS
if (isProduction) {
  css = new CleanCss(css);
}

// Copy public files into destination
const public = funnel('public', {
  annotation: "Public files",
});

// Remove the existing module.exports and replace with:
let tree = merge([html, js, css, public, templatesTree], {annotation: "Final output"});

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
