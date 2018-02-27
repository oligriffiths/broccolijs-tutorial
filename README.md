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

This should start a local HTTP server on `http://localhost:4200`

## 01-Setup:

First things first, install broccoli-cli:

`npm install -g broccoli-cli`

Then, create a new directory for this tutorial, and:

`yarn install --dev broccoli` or `npm install --save-dev broccoli`

In your `package.json` add the following to the `scripts` node (add this if it's not present):

```
"clean": "rm -rf dist",
"build": "npm run clean && broccoli build dist",
"serve": "broccoli serve || 1",
```

You can now use `npm run build` and `npm run serve` for convenience.

Now create a `Brocfile.js` in the root of your project, with the contents: `module.exports = "app";`.

Next, create a directory `app` within the project, and add a `index.html` file with the contents
`hello world`.

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
