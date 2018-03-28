## 03-Merge Trees

The first examples are fairly contrived and not that useful. We'll want to be able to work with multiple trees,
and ultimately have them written to our target directory.

Introducing, [broccoli-merge-trees](https://github.com/broccolijs/broccoli-merge-trees)

```sh
yarn add --dev broccoli-merge-trees
```

Now let's add a `public` directory so we can ship unprocessed assets like images:

```sh
mkdir -p public/images
```

Now let's add a JS and a CSS file that'll be the root of our web app and copy that into an `assets` folder.

```sh
mkdir -p app/styles
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
Eat your greens!
<br />
<img src="/images/broccoli-logo.png" />
<script src="/assets/app.js"></script>
</body>
</html>
```

In `public/images` add this image, named `broccoli-logo.png`

![logo](/docs/assets/broccoli-logo.png)

```js
// Brocfile.js
const Funnel = require("broccoli-funnel");
const Merge = require("broccoli-merge-trees");

const appRoot = "app";

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files: ["index.html"],
  annotation: "Index file",
});

// Copy JS file into assets
const js = new Funnel(appRoot, {
  files: ["app.js"],
  destDir: "/assets",
  annotation: "JS files",
});

// Copy CSS file into assets
const css = new Funnel(appRoot, {
  srcDir: "styles",
  files: ["app.css"],
  destDir: "/assets",
  annotation: "CSS files",
});

// Copy public files into destination
const public = new Funnel('public', {
  annotation: "Public files",
});

module.exports = new Merge([html, js, css, public]);
```

Again, pretty simple. We've added 2 filters for our `js` and `css`, that's taken an input node `appRoot`, filtered out
all files except the `app.js` and `app.css` and will copy the files to the `destDir` of `/assets` within the target
directory.

We've also added a `public` filter, that merely copies the contents of `/public` and added it to the output directory.

Then, we take all these nodes, and merge them together, so all files end up in the target directory.

Now run `yarn serve`, refresh your browser and you should get an alert message saying `Eat your greens` with a nice pale
green background.

Running `yarn build` the target `dist` directory should contain:

```sh
assets/app.js
assets/app.css
images/broccoli-logo.png
index.html
```

Completed Branch: [examples/03-merge-trees](https://github.com/oligriffiths/broccolijs-tutorial/tree/examples/03-merge-trees)

Next: [04-sass-preprocessing](/docs/04-sass-preprocessing.md)
