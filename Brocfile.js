const funnel = require("broccoli-funnel");
const merge = require("broccoli-merge-trees");
const compileSass = require('broccoli-sass-source-maps')(require('sass'));

const appRoot = "app";

// Copy HTML file from app root to destination
const html = funnel(appRoot, {
  files: ["index.html"],
  annotation: "Index file",
});

// Copy JS file into assets
const js = funnel(appRoot, {
  files: ["app.js"],
  destDir: "/assets",
  annotation: "JS files",
});

// Compile sass files
const css = compileSass(
  [appRoot],
  "styles/app.scss",
  "assets/app.css",
  {
    sourceMap: true,
    sourceMapContents: true,
    annotation: "Sass files"
  }
);

// Copy public files into destination
const public = funnel('public', {
  annotation: "Public files",
});

module.exports = merge([html, js, css, public], {annotation: "Final output"});
