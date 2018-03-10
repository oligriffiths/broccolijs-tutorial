## 04-SCSS Preprocessing

Branch: [examples/04-sass-preprocessing](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/04-sass-preprocessing)

So our app is coming along, we have an index page that loads a javascript file and a lovely green background.
But css is so old school, we want to be able to write some fancy scss and have a preprocessor convert that to
css for us.

For the purposes of this tutorial, I am going to use SCSS, however there are sass, less and other preprocessors
available to use in a Broccoli build. Check NPM.

For this, we will use the excellent [broccoli-sass-source-maps](https://github.com/aexmachina/broccoli-sass-source-maps)
plugin.

```sh
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
const Funnel = require("broccoli-funnel");
const Merge = require("broccoli-merge-trees");
const CompileSass = require("broccoli-sass-source-maps");

const appRoot = "app";

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files: ["index.html"],
  destDir: "/"
});

// Copy JS file into assets
const js = new Funnel(appRoot, {
  files: ["app.js"],
  destDir: "/assets"
});

// Compile sass files
const css = new CompileSass(
  [appRoot],
  "styles/app.scss",
  "assets/app.css"
);

// Copy public files into destination
const public = new Funnel('public', {
  destDir: "/"
});

module.exports = new Merge([html, js, css, public]);
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
const css = new CompileSass(
  [appRoot],
  "styles/app.scss",
  "assets/app.css",
  {
    sourceMap: true,
    sourceMapContents: true,
  }
);
```

Now `build & serve` and you should see that when inspecting the html tag, the line has changed to line 2 and the
file is now `app.scss`. If you click the file name in the inspector, it should take you to the source `app.scss` 
file, showing the original scss, complete with variables.

See the Github repo for more details on further configuration options.

Next: [05-es6-transpilation](/docs/05-es6-transpilation.md)
