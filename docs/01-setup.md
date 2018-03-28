## 01-Setup:

First things first, it is assumed that you know how to use a terminal on your machine, if you're unfamiliar with the
terminal, best get familiar with that first.

You're also going to want to use Node 8 as this is the current LTS (long term support) version.

We're going to use [yarn](https://yarnpkg.com) instead of `npm` to ensure our dependencies are in lock step.

Now install the broccoli-cli tool globally:

`yarn global add broccoli-cli`

The `broccoli` command should now be available in your terminal. This CLI tool just checks some basic dependencies in
the current project before running the main broccoli library. So lets do that next.

Create a new directory for this tutorial and install broccoli:

```sh
mkdir broccoli-tutorial
cd broccoli-tutorial
yarn add --dev broccoli@^1.1.4
```

In your `package.json` add the following to the `scripts` node (add this if it's not present):

```json
{
    "scripts": {
        "clean": "rm -rf dist",
        "build": "yarn clean && broccoli build dist",
        "serve": "broccoli serve",
        "debug-build": "yarn clean && node $NODE_DEBUG_OPTION $(which broccoli) build dist",
        "debug-serve": "node $NODE_DEBUG_OPTION $(which broccoli) serve"
    }
}
```

You can now use `yarn build` and `yarn serve` for convenience.

Note: the `debug-build` and `debug-serve` are for use with [VS Code](https://code.visualstudio.com/) to allow for
interactive debugging. If you wish to use this, you'll need the files in
[this directory](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/00-init/.vscode).
You can add breakpoints by clicking in the column to the left of the line numbers (on the left) and then hit the
`debug` icon on the very left side of the screen (looks like a bug) or CMD + SHIFT + D, select `debug-build` from the
dropdown menu at the top, and click "play".

Note: the `clean` task is used to remove the `dist` directory before the build, or broccoli complains that the directory
already exists.

### Brocfile.js

A `Brocfile.js` must live in the root of your project, this is what will contain your build pipeline.

So create a `Brocfile.js` in the root of your project, with the contents: 

```js
// Brocfile.js
module.exports = "app";
```

Next, create a directory `app` within the project, and add a `index.html` file with the contents `Eat your greens!`.

```sh
mkdir app
echo 'Eat your greens!' > app/index.html
```

That's it, you're done.

The initial setup of this tutorial merely copies files from the input `app` directory by exporting the string `app`.
The `Brocfile.js` contains the Broccoli configuration for the build. The `module.exports` line must export a Broccoli
tree. "But it's a string" you say, yes, Broccoli will automatically convert a string into a `source node`, and on build,
validate that the directory exists. In this case, the Brocfile merely exports a single tree, containing the contents of
the `app` directory, this will then be copied to the destination directory (`dist` in our case).

To run a build, run `yarn build` (if you added the script) or `rm -rf dist && broccoli build dist`.
You should see something like:

```sh
$ yarn clean && broccoli build dist
$ rm -rf dist
✨  Done in 1.05s.
```

This npm run command will remove any previous builds, and run a new build, outputting to the `dist` directory.
Broccoli doesn't remove previous builds by default, so we must remove it before starting a new build.

The contents of `app` should now be in the `dist` directory. Try:

```sh
$ cat dist/index.html
Eat your greens!
```

Now try running `yarn serve` or `broccoli serve` and you should see:

```sh
$ broccoli serve
Serving on http://localhost:4200




Built - 0 ms @ Wed Mar 28 2018 11:25:30 GMT-0400 (EDT)
```

You will see the URL `http://localhost:4200`, if you open this in the browser, you should see:

![browser](/docs/assets/01-setup.png)

Great, your first Broccoli build is complete, pat yourself on the back 👏.

Completed Branch: [examples/01-setup](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/01-setup)

Next: [02-funnelling-files](/docs/02-funnelling-files.md)
