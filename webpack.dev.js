const prod = require("./webpack.prod.js");

prod.devtool = "inline-source-map";

module.exports = prod;
