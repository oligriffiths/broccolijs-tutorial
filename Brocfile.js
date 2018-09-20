const funnel = require("broccoli-funnel");
const merge = require("broccoli-merge-trees");

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

// Copy CSS file into assets
const css = funnel(appRoot, {
  srcDir: "styles",
  files: ["app.css"],
  destDir: "/assets",
  annotation: "CSS files",
});

// Copy public files into destination
const public = funnel('public', {
  annotation: "Public files",
});

module.exports = merge([html, js, css, public], {annotation: "Final output"});
