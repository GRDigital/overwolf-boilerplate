const prod = require("./webpack.prod.js");
const TerserPlugin = require("terser-webpack-plugin");
const root = process.cwd();

prod.entry = [
	`${root}/src/tools/bootstrapper`,
];
prod.output = {
	path: `${root}/public/extension`,
	filename: "bootstrapper.js",
};
prod.optimization = {
	minimizer: [new TerserPlugin()],
};

module.exports = prod;
