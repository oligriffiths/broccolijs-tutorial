const Funnel = require("broccoli-funnel");
const Merge = require("broccoli-merge-trees");
const CompileSass = require("broccoli-sass-source-maps");
const Rollup = require("broccoli-rollup");
const babel = require("rollup-plugin-babel");

const appRoot = "app";

// Copy HTML file from app root to destination
const html = new Funnel(appRoot, {
  files: ["index.html"],
  annotation: "Index file",
});

// Compile JS through rollup
let js = new Rollup(appRoot, {
  inputFiles: ["**/*.js"],
  annotation: "JS Transformation",
  rollup: {
    input: "app.js",
    output: {
      file: "assets/app.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [
      babel({
        exclude: "node_modules/**",
      })
    ],
  }
});

// Copy CSS file into assets
const css = new CompileSass(
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
const public = new Funnel("public", {
  annotation: "Public files",
});

module.exports = new Merge([html, js, css, public], {annotation: "Final output"});
