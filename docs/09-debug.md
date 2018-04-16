# 10-Debugging

Because Broccoli handles managing the state of the file system between transformations, it can sometimes be tricky to
debug at what stage a transformation went wrong. Luckily, there is a handy and hilariously named ;) package called 
[broccoli-stew](https://github.com/stefanpenner/broccoli-stew).

```sh
yarn add --dev broccoli-stew@^1.5.0
```

The stew package contains several handy utilities, specifically the `log` and `debug` utilities.

## Log

The log package allows you to print to the console the state of a node at any point throughout the build pipeline. It's
very simply configured, as follows:

```js
const log = require('broccoli-stew').log;

// Log the output tree
tree = log(tree, {
  output: 'tree',
});
```

The `log` method is imported from the `broccoli-stew` package, and just wraps an existing node/tree, you can add multiple
log methods to various stages of your pipeline, and each print the filename it contains to the screen, for example:

```
└── assets/
   ├── assets/app.css
   ├── assets/app.css.map
   ├── assets/app.js
   └── assets/app.js.map
└── images/
   ├── images/broccoli-logo.png
└── index.html
```

Try it at different stages of the build and see what each tree looks like.

## Debug

Much like the `log` utility, the `debug` utility allows you to inspect the state of the file system, but instead of
printing the state to the console, it writes it to disk.

To use the debug utility:

```js`
const debug = require('broccoli-stew').debug;

// Write tree to disk
tree = debug(tree, 'my-tree');
``

When running `yarn build`, you will now see a folder in the root of the project called `DEBUG` that contains a folder
called `my-tree` with the contents of `tree` that whatever stage of the build it was added.

This is useful when you want to see the contents of files as they go through the various transformations, as opposed
to just logging the file names.

Completed Branch: [examples/09-debug](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/09-debug)

Next: [10-environment](/docs/10-environment.md)
