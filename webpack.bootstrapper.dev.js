const prod = require("./webpack.bootstrapper.prod.js");

prod.devtool = "cheap-module-eval-source-map";

module.exports = prod;
