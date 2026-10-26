let app;
try {
  app = require("../index.js");
} catch (e) {
  app = require("../Index.js");
}

module.exports = app;
