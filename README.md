# Eat your greens! Broccoli.js for beginners

Welcome to the world of Broccoli.js. So, I'm sure you're wondering, what _is_ Broccoli.js?

Well, per the [Broccoli.js website](http://broccolijs.com)

> The asset pipeline for ambitious applications

Cool, wait, what the hell does that mean?

<!-- more -->

"Ambitious applications"? That sounds scary, I just wanna make a
simple JS app, with ES6 transpilation, SCSS pre-processing, asset concatenation, live reload, uglification,
vendor npm module inclusion, developement server, and, oh, wait, perhaps it's ambitious.

Oh, yeah, and I want all that to be fast.

Historically, we had grunt, and decided we didn't like configuration files.
Then we had gulp, because we wanted to write code to compile our code, then it got slow.
Then we had webpack that does bundling, minifaction, source maps, but, it's kinda hard to configure.
So Broccoli.js provides a simple Javascript API to do simple and complex file transformations, and do it fast.

## Follow along

Here's a talk I gave at EmberNYC meetup in Jan 2017 that covers most of this article.

[Watch EmberNYC video](https://www.youtube.com/embed/JTzvYJBxwyI?start=141&end=1377)

[![Watch EmberNYC video](https://img.youtube.com/vi/JTzvYJBxwyI/0.jpg)](https://www.youtube.com/embed/JTzvYJBxwyI?start=141&end=1377)

## Enter Broccoli.js.

So, how is Broccoli any different? Broccoli is structured around a concept of `nodes` and `plugins`, that
allows the build pipeline to be structured somewhat like a "tree". The term `tree` in Broccoli is synonymous
with a `node` and was the previously used to refer to them (so don't get confused if you see the term tree
used in other documentation).

Nodes represent one or more input directories, and an output directory.
The output directory is automatically created by Broccoli itself.

Plugins are third party provided npm packages, that take one or more input nodes (directories), perform some kind of transformation, and emit files to an output path. This output path can then become an input path to the next node in the chain.

Nodes can then be manipulated via various broccoli plugins, to do things like copy files to the destination
directory, pre-process files and convert them from one format to another (e.g. .scss to .css), merge trees
together (think rsync'ing one directory into another), concatenate files of a certain type into one
(bundling), uglifying, and so on.

### How do nodes work?

Nodes are what Broccoli uses to represent snapshots of directories and the transformations between states.

Nodes themselves don't actually contain file contents, and manipulations to the nodes don't happen when you
create them. Nodes take one or more inputs (directories), and are provided an output (directory) by Broccoli. They're essentially representations of state, they can be combined, split, filtered for specific file types,
etc.

Broccoli handles creating the node graph, that is, connecting the output paths of one or more nodes, to the input paths of another that will be consumed by the next plugin.

Nodes are always one of two types, `source` nodes and `transform` nodes.

`source` nodes represent a single input directory, and are implicitly created when you use a `string` as an input to a plugin. Typically source nodes are "watched" directories, and chages to any files within them will trigger a rebuild of their node "tree". You can also create unwatched directories for things like vendor files that don't change often.

`transform` nodes represent one or more input nodes, and are typically created by the output of plugins. Transform nodes delegate to a callback object (a plugin) during build time.

### How do plugins work?

State transformations are performed by plugins. Plugins recieve one or more input nodes, and write their
output to the provided `outputPath` that Broccoli creates. Broccoli then takes the contents of `outputPath`
and provides that as the `inputPaths` for the node to the next plugin.

So plugins take at least one input path, perform some processing on the files within those input paths, and
write their result to the provided `outputPath` and Broccoli handles wiring all this up for you. This way
each plugin is only concerned with the transformation that it needs to do.

Plugins can also cache their output based usually on the hashes of their input paths, or any other factor.
This way if the inputs to a plugin have not changed, then the plugin can supply a previously built output
path.

Plugins are very simple JS classes that accept one or more input nodes, and implement a `build()` method that
is called when broccoli performs a (re)build.

### Building

Broccoli build pipelines are defined using a `Brocfile.js` file in the root of the project. This `js` file
defines the `source` nodes, passes them through various plugins creating `transform` nodes, and finally
returns a single node that represents the final output of the build. Broccoli will then handle wiring up
all of the nodes inputs and outputs into a graph (from the end node up to the start nodes), creating temporary
directories as it goes, run the build and invoke the `build()` method on each plugin, and finally copy the
files from the final node into the destination build directory.

Confused? Here's an example:

```js
const mergeTrees = require("broccoli-merge-trees"); // broccoli merge-trees plugin
module.exports = mergeTrees(["dir1", "dir2"]);
```

This is a very simple `Brocfile.js` that merely merges the contents of `dir1` and `dir2` into the output
directory. The node graph would be represented as follows:

```
source node
            =====> transform node
source node
------------------------
/dir1 => source node 1
/dir2 => source node 2
mergeTrees(
    'dir1', => source node, implicitly created when using a string as an input
    'dir2' => source node, implicitly created when using a string as an input
)
module.exports = transformation node with input nodes dir1 and dir2
```

Thus `module.exports` contains a node that references the two input nodes, and an output path that will
contain the contents of `dir1` and `dir2` when the `build` command is run. The two input nodes reference
two source directories, `dir1` and `dir2`.

It sounds like a lot, but it's actually quite simple, so let's get started with a simple Broccoli app.

### Serving

One last thing. Broccoli comes with a built in dev server, that provides an HTTP server to host your assets
in development, and perform rebuilds when source directories (nodes) change.

To run the server, do:

`broccoli serve`

This will start a local HTTP server on `http://localhost:4200`, note: this won't work right now, we must
setup Broccoli first.

## 01-Setup:

First things first, install broccoli-cli:

`npm install -g broccoli-cli`

Then, create a new directory for this tutorial, and:

`yarn install --dev broccoli` or `npm install --save-dev broccoli`

In your `package.json` add the following to the `scripts` node (add this if it's not present):

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "build": "npm run clean && broccoli build dist",
    "serve": "broccoli serve || 1"
  }
}
```

You can now use `npm run build` and `npm run serve` for convenience. I will refer to these as `build` and
`serve` going forwards.

Now create a `Brocfile.js` in the root of your project, with the contents: `module.exports = "app";`.

Next, create a directory `app` within the project, and add a `index.html` file with the contents
`Hello World`.

That's it, you're done. Checkout tag: [01-setup](https://github.com/oligriffiths/broccolijs-tutorial/tree/01-setup) if you got lost.

The initial setup of this tutorial merely copies files from the input `app` directory by exporting the
string `app`. The `Brocfile.js` contains the Broccoli configuration for the build. The `module.exports`
line must export a Broccoli tree. "But it's a string" you say, yes, Broccoli will automatically convert
a string into a `source node`, and on build, validate that the directory exists. In this case, the
Brofile merely exports a single tree, containing the contents of the `app` directory, this will then be
copied to the destination directory (`dist` in our case).

To run a build, run `npm run build` (if you added the script) or `rm -rf dist && broccoli build dist`.
You should see something like:

```
> broccoli-tutorial@0.0.0 build /Users/oli/Projects/broccoli-tutorial
> npm run clean && broccoli build dist

> broccoli-tutorial@0.0.0 clean /Users/oli/Projects/broccoli-tutorial
> rm -rf dist
```

This npm run command will remove any previous builds, and run a new build, outputting to the `dist` directory.
Broccoli doesn't remove previous builds by default, so we must remove it before starting a new build.

The contents of `app` should now be in the `dist` directory. Try:

```
$ ls dist
index.html
```

Now try running `npm run serve` or `broccoli serve` and open `http://localhost:4200`, you should see your
hello world application.

Great, your first Broccoli build is complete, pat yourself on the back 👏.

## 02-Filtering files

Copying the whole input directory to the output directory isn't what one would really call a build pipeline.
Sure, it does the job, but you might as well just ship your `app` directory. Lets have a go at filtering
the files we're going to build, kind of like a `glob()` file search. For this, we use
[broccoli-filter](https://github.com/broccolijs/broccoli-filter).

```
yarn add --dev broccoli-funnel
```

Now update your `Brocfile.js`

```js
// Brocfile.js
const funnel = require("broccoli-funnel");

const appRoot = "app";

// Copy HTML file from app root to destination
const html = funnel(appRoot, {
  files: ["index.html"],
  destDir: "/"
});

module.exports = html;
```

What we're doing here should be fairly self explanatory, although the "funnel" bit seems a bit misleading.

Per the docs:

    The funnel plugin takes an input node, and returns a new node with only a subset of the files from the
    input node. The files can be moved to different paths. You can use regular expressions to select which
    files to include or exclude.

Basically, this is taking an input node, which can be a string representing a directory or another node,
selecting only the index.html file (this can be a regex match also) and moving it to the destDir, the root of
the output path.

Finally, we return the node as the module export, and Broccoli handles all the rest.

Running `npm run build` won't really produce any different output, as we only have one file right now,
so try adding another file to `/app` and rebuilding, you will not see that file in the `dist` directory.

Tag: [02-filtering-files](https://github.com/oligriffiths/broccolijs-tutorial/tree/02-filtering-files)

## 03-Merge Trees

The first examples are fairly contrived and not that useful. We'll want to be able to work with multiple trees,
and ultimately have them written to our target directory.

Introducing, [broccoli-merge-trees](https://github.com/broccolijs/broccoli-merge-trees)

```
yarn add --dev broccoli-merge-trees
```

Now let's add a JS and a CSS file that'll be the root of our web app and copy that into an `assets` folder.

```
mkdir app/styles
```

In `app/styles/app.css` put:

```css
html {
  background: palegreen;
}
```

In `app/app.js` put:

```js
alert("Eat your greens");
```

In `app/index.html` put:

```html
<!doctype html><html>
<head>
    <title>Broccoli.js Tutorial</title>
    <link rel="stylesheet" href="/assets/app.css" />
</head>
<body>
Hello World
<script src="/assets/app.js"></script>
</body>
</html>
```

```js
// Brocfile.js
const funnel = require("broccoli-funnel");
const merge = require("broccoli-merge-trees");

const appRoot = "app";

// Copy HTML file from app root to destination
const html = funnel(appRoot, {
  files: ["index.html"],
  destDir: "/"
});

// Copy JS file into assets
const js = funnel(appRoot, {
  files: ["app.js"],
  destDir: "/assets"
});

// Copy CSS file into assets
const css = funnel(appRoot, {
  srcDir: "styles",
  files: ["app.css"],
  destDir: "/assets"
});

module.exports = merge([html, js, css]);
```

Again, pretty simple. We've added 2 more filters, a `js` tree and a `css`, that's taken an input node
`appRoot`, filtered out all files except the `app.js` and `app.css` and will copy the files to the `destDir`
of `/assets` within the target directory. Then, we take all trees, and merge them together, so all files end
up in the target directory.

Now `build & serve`, you should get an alert message saying `Eat your greens` with a nice pale green
background.

The target `dist` directory should contain:

```
assets/app.js
assets/app.css
index.html
```

Tag: [03-filtering-files](https://github.com/oligriffiths/broccolijs-tutorial/tree/03-merge-trees)

## 04-SCSS Preprocessing

So our app is coming along, we have an index page that loads a javascript file and a lovely green background.
But css is so old school, we want to be able to write some fancy scss and have a preprocessor convert that to
css for us.

For the purposes of this tutorial, I am going to use SCSS, however there are sass, less and other preprocessors
available to use in a Broccoli build. Check NPM.

For this, we will use the excellent [broccoli-sass-source-maps](https://github.com/aexmachina/broccoli-sass-source-maps)
plugin.

```
yarn add --dev broccoli-sass-source-maps
mv app/styles/app.css app/styles/app.scss
```

In `app/styles/app.scss` put:

```scss
$body-color: palegreen;
html {
  background: $body-color;
  border: 5px solid green;
}
```

```js
// Brocfile.js
const funnel = require("broccoli-funnel");
const merge = require("broccoli-merge-trees");
const compileSass = require("broccoli-sass-source-maps");

const appRoot = "app";

// Copy HTML file from app root to destination
const html = funnel(appRoot, {
  files: ["index.html"],
  destDir: "/"
});

// Copy JS file into assets
const js = funnel(appRoot, {
  files: ["app.js"],
  destDir: "/assets"
});

// Copy SCSS file into assets
const css = compileSass([appRoot], "styles/app.scss", "assets/app.css", {});

module.exports = merge([html, js, css]);
```

As you can see, we're now using the `compileSass` plugin to transform our `scss` file into a `css` file, and
emit it into the `/assets` directory. The last parameter is an options hash that we will cover in a moment.

Now `build & serve` and you should see the newly compiled `scss` file has generated a `css` file with the
addition of the green border on the `html` element. Pretty neat. You can now use this `app/styles/app.scss`
file as your entrypoint for scss/sass compilation.

### Source maps
      
As the name of the plugin suggests, it supports source maps. Source maps are a great way during development
to be able see where styles have come from in the source `scss` document, rather than the compiled `css` document.

Try inspecting the html tag right now, you should see the `html` style is defined in `app.css` on line 1, however
it's actually defined in the `app.scss` on line 2. This is a fairly trivial example but gets way complicated
when you have imported files and lots of scss processing being done.

To enable source maps, add the following to the options hash that's the last parameter to `compileSass()`.

```js
// Brocfile.js
// ...
const css = compileSass(
[appRoot],
'styles/app.scss',
'assets/app.css',
{
  sourceMap: true,
  sourceMapEmbed: true,
  sourceMapContents: true,
}
);
```

Now `build & serve` and you should see that when inspecting the html tag, the line has changed to line 2 and the
file is now `app.scss`. If you click the file name in the inspector, it should take you to the source `app.scss` 
file, showing the original scss, complete with variables.

See the Github repo for more details on further configuration options.

Tag: [04-sass-preprocessing](https://github.com/oligriffiths/broccolijs-tutorial/tree/04-sass-preprocessing)


## 05-ES6 Transpilation

So, our javascript is just your run-of-the-mill, runs in the browser, ES5, boring old javascript. But we're making
a shiny new, state-of-the-art javascript application, so we should really be pushing the latest and greatest ES6
syntax. Step up [Babel](https://babeljs.io).

`Babel` is a javascript compiler. It will transpile (convert from one format to another), ES6 syntax javascript, to
ES5 syntax javascript that is runnable in the browser. For this, we will require 
[broccoli-babel-transpiler](https://github.com/babel/broccoli-babel-transpiler).
 
```
yarn add --dev broccoli-babel-transpiler babel-preset-env
```

Now open `app/app.js` and set the contents to:

```js
// app/app.js
const message = 'Eat your greens';
function foo() {
    setTimeout(() => {
        alert(message);
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
  presets: [
  [
    'env', {
    'targets': {
      'browsers': ["last 2 versions"],
    }
  }]],
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
```

So what's happening here? First off, we've declared `js` as a mutable variable (`let`) rather than an immutable
variable (`cosnt`) so we can re-assign it. Next, we pass the `js` tree into the babel transpiler, this will 
transpile the ES6 syntax to ES5.

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
* You should also notice the sourcemap at the bottom

If you run this in the browser, you'll see the alert and the correct `this` is logged to the console.

Now try adding a `debugger;` statement into the function and notice that the console stops at the breakpoint.
The presented source code should be the original ES6 version, *not* the transpiled ES5 version.

Tag: [05-es6-transpilation](https://github.com/oligriffiths/broccolijs-tutorial/tree/05-es6-transpilation)
