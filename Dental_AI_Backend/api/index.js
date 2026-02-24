const app = require('../src/app');

module.exports = (req, res) => {
  app.handle(req, res);
};