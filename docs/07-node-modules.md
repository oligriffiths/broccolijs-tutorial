## 07-Node & Commonjs modules

Rollup only knows about your code by default, it has no idea about `node_modules` code or how to resolve it. As such
we must configure it to know how to resolve node modules you might import.

```sh
yarn add --dev rollup-plugin-node-resolve@^3.2.0 rollup-plugin-commonjs@^8.4.1
```

Note: we need to use `rollup-plugin-commonjs@^8.4.1` as the newer version relies on a Rollup.js version above the
`broccoli-rollup` version.

Now update your `Brocfile.js`:

```js
const Funnel = require("broccoli-funnel");
const Merge = require("broccoli-merge-trees");
const CompileSass = require("broccoli-sass-source-maps");
const Rollup = require("broccoli-rollup");
const babel = require("rollup-plugin-babel");
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const appRoot = "app";

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files: ["index.html"],
  annotation: "Index file",
});

// Compile JS through rollup
let js = new Rollup(appRoot, {
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

// Copy CSS file into assets
const css = new CompileSass(
  [appRoot],
  "styles/app.scss",
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

module.exports = new Merge([html, js, css, public], {annotation: "Final output"});
```

And update `app/app.js` with:

```js
"use strict";

import foo from './foo';
import { fooNamed } from './foo';
import magic from 'magic-string';
import { Bundle } from 'magic-string';
import diff from 'arr-diff';

console.log(foo, magic, Bundle, diff([1,2,3], [3,4,5]));
```

This will now allow Rollup to import the native `ES6` module `magic-string` (that just happens to be a a dependency of
`rollup-plugin-commonjs`) with a `default` and a `named` import of `Bundle`, and the Commonjs module `arr-diff` which 
uses the `module.exports` syntax for both a `default` export. The commonjs plugin also also supports custom named
exports from CJS npm modules if the `default` export is a plain old javascrit object (POJO), see the
[CommonJs plugin docs](https://github.com/rollup/rollup-plugin-commonjs#custom-named-exports) for details.


Go ahead and run this with `yarn serve` and check the console, you should get:

```sh
foo ƒ MagicString$1( string, options ) {
	if ( options === void 0 ) options = {};

	var chunk = new Chunk( 0, string.length, string );

	Object.defineProperties( this, {
		original:              { writable… ƒ Bundle( options ) {
	if ( options === void 0 ) options = {};

	this.intro = options.intro || '';
	this.separator = options.separator !== undefined ? options.separator : '\n';

	this.sources = [];

	t… (2) [1, 2]
```

If you check the built output, by running `yarn build`, and look at `assets/app.js`, it should contain the inlined
versions of those modules

Completed Branch: [examples/07-node-modules](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/07-node-modules)

Next: [07-node-modules](/docs/08-live-reload.md)
