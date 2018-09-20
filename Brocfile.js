const funnel = require("broccoli-funnel");

module.exports = funnel('app', {
  files: ["index.html"],
  destDir: "/",
  annotation: 'Index file',
});
