## 05-ES6 Transpilation

Branch: [examples/05-es6-transpilation](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/05-es6-transpilation)

So, our javascript is just your run-of-the-mill, runs in the browser, ES5, boring old javascript. But we're making
a shiny new, state-of-the-art javascript application, so we should really be pushing the latest and greatest ES6
syntax. Step up [Babel](https://babeljs.io).

`Babel` is a javascript transpiler. It will transpile (convert from one format to another), ES6 syntax javascript, to
ES5 syntax javascript that is runnable in the browser. For this, we will require 
[broccoli-babel-transpiler](https://github.com/babel/broccoli-babel-transpiler).
 
```
yarn add --dev broccoli-babel-transpiler babel-preset-env babel-plugin-external-helpers
```

Now open `app/app.js` and set the contents to:

```js
// app/app.js
const message = 'Eat your greens';
function foo() {
    setTimeout(() => {
    console.log(message);
    console.log(this);
});
}
new foo();
```

```js
// Brocfile.js
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

Make a `.babelrc` file in the root directory:
```json
{
  "presets": [
    [
      "env",
      {
        "targets": {
          "browsers": ["last 2 versions"]
        }
      }
    ]
  ],
  "plugins": [
    "external-helpers"
  ]
}
```

So what's happening here? First off, we've declared `js` as a mutable variable (`let`) rather than an immutable
variable (`cosnt`) so we can re-assign it. Next, we pass the `js` tree into the babel transpiler, this will 
transpile the ES6 syntax to ES5. The `.bablerc` is the standard practice for configuring Babel, here we're targeting
the last 2 major versions of each browser for transpilation, this means that language features that are unsupported in
these browsers will have them transpiled into a format that *is* compatible.

If you `build` this now, and open `dist/assets/app.js`, you should see:

```js
// dist/assets/app.js
'use strict';

var message = 'Eat your greens';
function foo() {
    var _this = this;

    setTimeout(function () {
        alert(message);
        console.log(_this);
    });
}
new foo();
//# sourceMappingURL=...
```

So, a few things have happened here:

* `const` has been changed to `var`
* The arrow function `() => {}` inside the setTimeout has been converted to a regular function.
* The use of `this` within the arrow function refers to the correct `this` context.
* You should also notice the sourcemap at the bottom, this has to be `inline` for this plugin to work

If you run this in the browser, you'll see the message and the correct `this` is logged to the console.

Now try adding a `debugger;` statement into the function and notice that the console stops at the breakpoint.
The presented source code should be the original ES6 version, *not* the transpiled ES5 version.
