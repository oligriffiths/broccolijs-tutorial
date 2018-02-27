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
