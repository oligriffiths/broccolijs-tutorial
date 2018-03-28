## 02-Funneling files

Copying the whole input directory to the output directory isn't what one would really call a "build pipeline".
Sure, it does the job, but you might as well just ship your `app` directory. Lets have a go at selecting only the files
we're going to build, kind of like a `glob()` file search. For this, we use
[broccoli-funnel](https://github.com/broccolijs/broccoli-funnel).

```sh
yarn add --dev broccoli-funnel@^2.0.1
```

Now update your `Brocfile.js`

```js
// Brocfile.js
const Funnel = require("broccoli-funnel");

const appRoot = "app";

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files: ["index.html"],
  destDir: "/",
  annotation: 'Index file',
});

module.exports = html;
```

What we're doing here should be fairly self explanatory, although the "funnel" bit seems a bit misleading.

Per the docs:

    The funnel plugin takes an input node, and returns a new node with only a subset of the files from the input node.
    The files can be moved to different paths. You can use regular expressions to select which files to include or exclude.

Basically, this is taking an input node, which can be a string representing a directory or another node,
selecting only the index.html file (this can be a regex match also) and moving it to the `destDir`, the root of
the output path. The default for `destDir` is `/`, so we can omit this in the future.

The `annotation` option is used for debugging and provides a useful way for you to add a label to the node, and when
printed out to the console, you'll see this label, useful for tracking down bugs, I would advise adding the annotation
option to all plugins.

Finally, we return the node as the module export, and Broccoli handles all the rest.

Running `npm run build` won't really produce any different output, as we only have one file right now, so let's try
adding some more files in the next step.

Completed Branch: [examples/02-funneling-files](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/02-funneling-files)

Next: [03-merge-trees](/docs/03-merge-trees.md)
