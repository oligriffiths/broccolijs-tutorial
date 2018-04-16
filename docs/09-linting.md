## 09-Linting

Our dev environment is nearly complete, the last piece of the puzzle is linting. If you're not familiar with it, linting
is the process of analyzing your files for syntax and code style errors, so they can be caught at build time, rather
than runtime.

We have 2 main file types, javacsript and scss files, so we should have linters for both:

```sh
yarn add --dev broccoli-lint-eslint@^3.3.2 broccoli-sass-lint@^1.1.2
```

Now, update your `Brocfile.js` with:

```js
const Funnel = require("broccoli-funnel");
const Merge = require("broccoli-merge-trees");
const EsLint = require("broccoli-lint-eslint");
const SassLint = require("broccoli-sass-lint");
const CompileSass = require("broccoli-sass-source-maps");
const Rollup = require("broccoli-rollup");
const LiveReload = require('broccoli-livereload');
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

// Include live reaload server
tree = new LiveReload(tree, {
  target: 'index.html',
});

module.exports = tree;
```

What we're doing here is performing JS and SCSS linting, *before* we do any transformations, as we want to know about
linting errors in our source files, not in the compiled output. As such, we're re-declaring `js` and `css`, and running
them through the plugins, then passing their output into their respective compilers, and update paths as appropriate.

Both eslint and sass-lint use configuration files to define the rules they use. There is plenty of documentation about
these on the web, but we're going to define some basic defaults for our app.

Now create a `.eslintrc.js` file in the root of the project with the following content:

```js
module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: "eslint:recommended",
  rules: {
    "no-console": 0,
  }
};
```

Now create a `.sass-lint.yml` file in the root of the project with the following content:

```yaml
rules:
  extends-before-mixins: 2 # throws error
  extends-before-declarations: 2 # throws error
```

The `.eslintrc.js` file defines the default ESLint rules, that we're using ES6, targeted for the browser, using the
default recommended rule set, and disabling the `no-console` rule (for testing). The `sass-lint.yaml` file defines
a couple of default rules for scss files. You can change any of these as you see fit for your project.

Now run `yarn build`, and you'll get the following errors:

```sh
/Users/goli/Projects/broccolijs-tutorial/broccolijs-tutorial-files/app/app.js
  4:10  error  'fooNamed' is defined but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)


app.scss
  1:1   warning  Space expected between blocks                                                empty-line-between-blocks
  1:14  warning  Color 'palegreen' should be written in its hexadecimal form #98fb98          no-color-keywords
  4:21  warning  Color 'green' should be written in its hexadecimal form #008000              no-color-keywords
  4:21  warning  Color literals such as 'green' should only be used in variable declarations  no-color-literals

✖ 4 problems (0 errors, 4 warnings)
```

So looks like we have a few errors. The first one is the eslint error, that `fooNamed` is defined and never used, this
is correct, check `app/app.js`, see that `fooNamed` is not used, so let's delete that line.

The sass errors require a few fixes, so update your `app/styles/app.scss` file to the following:

```scss
$body-color: #98fb98;
$border-color: #008000;

html {
  background: $body-color;
  border: 5px solid $border-color;
}
```

We're now defining the colors as variables, and not using the short name for the colors but the full hex value.

Now run `yarn build` and your project should build with no errors.

Completed Branch: [examples/09-linting](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/09-linting)

Next: [10-environment](/docs/10-environment.md)
