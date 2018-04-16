## 06-ES6 module imports

ES6 allows you to import code from other Javascript files using the following syntax:

```js
import foo from './foo'; 
```

Try creating a file `app/foo.js` with the contents:

```js
// app/foo.js
export const fooNamed = 'fooNamed';
export default 'foo';
```

and set the contents of `app/app.js` to:

```js
// app/app.js
import foo from './foo';
import { fooNamed } from "./foo";

console.log(foo);
```

Now run `yarn serve`, refresh the browser, and:

```sh
app.js:5 Uncaught ReferenceError: require is not defined
    at app.js:5
```

Uh oh, what's going on? Well, babel will transpile ES6 to ES5, however `import` statements are converted to
node compatible `require()` AMD calls. The browser doesn't have a mechanism for resolving `require()` calls by default
so we need a way of handling this.

* Browserify via `broccoli-watchify`
* Requirejs via `broccoli-requirejs`
* Babel via `babel-plugin-transform-es2015-modules-systemjs`
* Rollup via `broccoli-rollup`

Browserify, Requirejs and Babel all require additional code to resolve dependencies, however Rollup does something
different.

So we're going to focus on [Rollup](http://rollupjs.org/) here because aside from module loading that natively works in
the browser, it has some fairly cool other features we will touch on. 

Here's what the website says:

> Rollup is a next-generation JavaScript module bundler. Author your app or library using ES2015 modules, then 
efficiently bundle them up into a single file for use in browsers and Node.js

So, first off, install rollup:

```sh
yarn add --dev broccoli-rollup rollup-plugin-babel@^6.1.4
```

And set your `Brocfile.js` file to:

```js
// Brocfile.js
const Funnel = require("broccoli-funnel");
const Merge = require("broccoli-merge-trees");
const CompileSass = require("broccoli-sass-source-maps");
const Rollup = require("broccoli-rollup");
const babel = require("rollup-plugin-babel");

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
      babel({
        exclude: "node_modules/**",
      })
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

Here are the changes:

1. Removed the JS funnel, this is no longer needed
2. Now we pass `appRoot` to `Rollup`, pass it an input filter with `inputFiles` to include all JS files
3. Rollup is configured with an `entry` file, this is the first file that is `required`.
4. Define a destination for the resulting rolled up build, and enable sourceMaps.
5. Add the `rollup-plugin-babel` to facilitate babel transformations, this is because the Rollup and Babel broccoli
plugins do not play nicely together when it comes to sourcemaps, however Rollup has plugin support for Babel.

Now `build & serve` and notice that the `require()` error has gone, and it console logs out `foo`, all is
good in the world!

But wait, there's more...

Whereas Browserify and Requirejs will wrap each module in a specialised function, rollup is more intelligent
and hoists modules up to first class citizens, producing the most efficient output.
Checkout `dist/assets/app.js`, you should see:

```js
// dist/assets/app.js
(function () {
'use strict';

var foo = 'foo';

console.log(foo);

}());
//# sourceMappingURL=app.js.map
```

As you can see, even though `app.js` imports `foo.js`, the compiled output doesn't contain any dynamic import functions,
like you'll see with require.js or system.js code, nor does it need an external loader.
The code is actually inlined. With the `format` parameter `iife`, the output gets wrapped in immediately invoked
function expressions so that it will run correctly in the browser. There are other format options available, checkout the
[Rollup docs](https://rollupjs.org/guide/en#big-list-of-options) for details.

But wait, there's more...

### Tree shaking

Tree what? Yeah, this an actual term that refers to removing dead/unused imported code.

Open `app/foo.js`

Notice we're also exporting a constant:

```js
export const fooNamed = 'fooNamed';
```

Open `app/app.js`

Notice we're importing this constant:

```js
import { fooNamed } from "./foo";
```

Now open `dist/assets/app.js`, notice how the `fooNamed` variable is nowhere to be seen? What is this witchcraft?

This is part of the magic of Rollup, it knows, through static analysis, what code is not being used and dynamically
removes it. Cool huh?

Completed Branch: [examples/06-es6-modules](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/06-es6-modules)

Next: [07-node-modules](/docs/07-node-modules.md)
