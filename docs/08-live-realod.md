## 08-Live Reload

Branch: [examples/08-live-reload](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/08-live-reload)

Well, obviously in dev we'd quite like to not have to hit refresh all the time, because developers are,
well, we're lazy. So we can use a live reload server to do the job for us.

```sh
yarn add --dev https://github.com/oligriffiths/broccoli-livereload.git#patch-1
```

We're using a patched version of the `broccoli-livereload` plugin as there is bug in the original causing certain files
not triggering a refresh, you can see my [Pull Request](https://github.com/stfsy/broccoli-livereload/pull/3) for details.

```js
// Brocfile.js
const Funnel = require('broccoli-funnel');
const Merge = require('broccoli-merge-trees');
const CompileSass = require('broccoli-sass-source-maps');
const Rollup = require('broccoli-rollup');
const LiveReload = require('broccoli-livereload');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const appRoot = 'app';

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files : ['index.html'],
  destDir : '/'
});

// Compile JS through rollup
let js = new Rollup(appRoot, {
  inputFiles: ['**/*.js'],
  rollup: {
    input: 'app.js',
    output: {
      file: 'assets/app.js',
      format: 'es',
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
        exclude: 'node_modules/**',
      }),
    ],
  }
});

// Copy CSS file into assets
const css = new CompileSass(
  [appRoot],
  'styles/app.scss',
  'assets/app.css',
  {
    sourceMap: true,
    sourceMapContents: true,
  }
);

// Copy public files into destination
const public = new Funnel('public', {
  destDir: "/"
});

// Remove the existing module.exports and replace with:
let tree = new Merge([html, js, css, public]);

// Include live reaload server
tree = new LiveReload(tree, {
  target: 'index.html',
});

module.exports = tree;
```

What we're doing here is assigning the final output of `Merge` to a mutable variable `tree`, then passing that into the
`LiveReload` plugin, that will auto-inject the Live Reload javascript and setup the server file watcher.

Now `build & serve`, try changing a `scss` file, notice how the css refreshes in place, no browser refresh. Change a
`.js` or `.html` file and the page will refresh. This doesn't support fancy hot reloading like React and Webpack does,
but that's a slightly different ballgame, and is very architecture dependent.

Next: [09-environment](/docs/09-environment.md)
