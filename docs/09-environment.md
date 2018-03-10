## 09-Environment

Branch: [examples/09-environment](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/09-environment)


Environment configuration allows us to include or not include certain things in the build given certain
configuration options. For example, we probably want to not include live reload for production builds,
for this we need to have different environments. When building, we can provide an environment flag option.
So lets go ahead and configure things to support this.

```
uarn add --dev broccoli-env
```

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
let js = new Rollup(appRoot, {
  inputFiles: ['**/*.js'],
  rollup: {
    input: 'app.js',
    output: {
      file: 'assets/app.js',
      format: 'es',
      sourcemap: !isProduction,
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
    sourceMap: !isProduction,
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
if (!isProduction) {
  tree = new LiveReload(tree, {
    target: 'index.html',
    options: {
      debug: true,
    }
  });
}

module.exports = tree;
```

What we've done here is wrapped the `LiveReload` section in an `env === "development"`, this ensures the `LiveReload`
tree is not included in the build when making a production build.

In order to pass in a different environment, simply add `BROCCOLI_ENV=production` before the build command, e.g.
`BROCCOLI_ENV=production broccoli build dist`. To make this simpler, lets add a new run command in `package.json`:

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "build": "npm run clean && broccoli build dist",
    "build-prod": "npm run clean && BROCCOLI_ENV=production broccoli build dist",
    "serve": "broccoli serve || 1",
    "debug-build": "npm run clean && node $NODE_DEBUG_OPTION $(which broccoli) build dist",
    "debug-serve": "node $NODE_DEBUG_OPTION $(which broccoli) serve"
  }
}
```

Now, running `npm run build-prod` will build in "production" mode.

Next: [10-minify](/docs/10-minify.md)
