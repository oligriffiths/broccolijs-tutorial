const Funnel = require("broccoli-funnel");

module.exports = new Funnel('app', {
  files: ["index.html"],
  destDir: "/"
});