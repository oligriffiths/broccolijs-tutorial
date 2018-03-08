## 07-Node & Commonjs modules

Branch: [examples/07-node-modules](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/07-node-modules)

Rollup only knows about your code by default, it has no idea about `node_modules` code or how to resolve it. As such
we must configure it to know how to resolve node modules you might import.

```
yarn add --dev rollup-plugin-node-resolve rollup-plugin-commonjs@^8.4.1
```

Note: we need to use `rollup-plugin-commonjs@^8.4.1` as the newer version relies on a Rollup.js version above the
`broccoli-rollup` version.

Now update your `Brocfile.js`:
```js
const Funnel = require('broccoli-funnel');
const Merge = require('broccoli-merge-trees');
const CompileSass = require('broccoli-sass-source-maps');
const Rollup = require('broccoli-rollup');
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

module.exports = new Merge([html, js, css, public]);

```

And update `app/app.js` with:

```js
'use strict';

import foo from './foo';
import bar from './foo';
import BlankObject from 'blank-object';
import diff from 'arr-diff';

const blank = new BlankObject();

console.log(foo, blank, diff([1,2,3], [3,4,5]));
```

This will now allow Rollup to import the native ES6 module `blank-object` and the Commonjs module `arr-diff`. Go ahead
and run this with `npm run serve` and check the console, you should get:

```
foo BlankObject {} (2) [1, 2]
```

Next: [07-node-modules](/blob/master/docs/08-live-reload.md)
