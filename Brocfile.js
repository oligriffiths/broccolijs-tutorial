const Funnel = require('broccoli-funnel');
const Merge = require('broccoli-merge-trees');
const CompileSass = require('broccoli-sass-source-maps');
const Babel = require('broccoli-babel-transpiler');

const appRoot = 'app';

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files : ['index.html'],
  destDir : '/'
});

// Copy JS file into assets
let js = new Funnel(appRoot, {
  files : ['app.js'],
  destDir : '/assets'
});

// Transpile JS files to ES5
js = new Babel(js, {
  browserPolyfill: true,
  sourceMap: 'inline',
  presets: [
    ['env', {
      'targets': {
        'browsers': ["last 2 versions"]
      }
    }]
  ],
});

// Copy CSS file into assets
const css = new CompileSass(
  [appRoot],
  'styles/app.scss',
  'assets/app.css',
  {
    sourceMap: true,
    sourceMapEmbed: true,
    sourceMapContents: true,
  }
);

module.exports = new Merge([html, js, css]);
