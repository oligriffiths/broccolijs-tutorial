module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: "eslint:recommended",
  rules: {
    "no-console": 0,
  }
};
