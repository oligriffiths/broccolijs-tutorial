## 10-Minify

Minifying or Uglifying as it's also sometimes called, is the process of turning normal Javascript or CSS,
into a compressed version, with much shorter variable and function names (for JS), and unnecessary whitespace removed
to save on bytes shipped to the browser. Fewer bytes means less time transferring files and less time for the browser
to parse the file.

```sh
yarn add --dev rollup-plugin-uglify broccoli-clean-css
```

This will install the Rollup Uglify plugin. It is also possible to use the `broccoli-uglify-sourcemap` Broccoli plugin,
and Rollup seems to work just fine with that plugin, however it makes more sense to use the supported Rollup plugin
rather than the Broccoli one. We're also installing the `broccoli-clean-css` plugin that will compress our CSS.

Now update your `Brocfile.js` to:

```js
const Funnel = require('broccoli-funnel');
const Merge = require('broccoli-merge-trees');
const CompileSass = require('broccoli-sass-source-maps');
const Rollup = require('broccoli-rollup');
const LiveReload = require('broccoli-livereload');
const CleanCss = require('broccoli-clean-css');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const env = require('broccoli-env').getEnv() || 'development';
const isProduction = env === 'production';

// Status
console.log('Environment: ' + env);

const appRoot = 'app';

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files : ['index.html'],
  destDir : '/'
});

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

let js = new Rollup(appRoot, {
  inputFiles: ['**/*.js'],
  rollup: {
    input: 'app.js',
    output: {
      file: 'assets/app.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    plugins: rollupPlugins,
  }
});

// Copy CSS file into assets
let css = new CompileSass(
  [appRoot],
  'styles/app.scss',
  'assets/app.css',
  {
    sourceMap: !isProduction,
    sourceMapContents: true,
  }
);

// Compress our CSS
if (isProduction) {
  css = new CleanCss(css);
}

// Copy public files into destination
const public = new Funnel('public', {
  destDir: "/"
});

// Remove the existing module.exports and replace with:
let tree = new Merge([html, js, css, public]);

// Include live reaload server
if (!isProduction) {
  tree = new LiveReload(tree, {
    target: 'index.html',
  });
}

module.exports = tree;
```

So what we're doing here is 2 things. 

1. Moving the Rollup plugins into a variable, so we can append the `uglify()` plugin only for production
2. Changing the `css` variable to `let` so we can overwrite it for production, passing it into `CleanCss()`

That's it, now try building your prod application: `npm run build-prod`

Completed Branch: [examples/11-minify](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/11-minify)

Next: [12-fingerprints](/docs/12-fingerprints.md)
