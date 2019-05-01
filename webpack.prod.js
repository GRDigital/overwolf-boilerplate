const TerserPlugin = require("terser-webpack-plugin");
const root = process.cwd();

const config = {};

config.target = "web";
config.entry = `${root}/src/client`;
config.output = {
	path: `${root}/public`,
	filename: "bundle.js",
};
config.module = {
	rules: [
		{
			test: /server[/\\]*/,
			use: "null-loader",
		},
		{
			test: /\.(jpe?g|png|ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
			use: "base64-inline-loader",
		},
		{
			test: /\.jsx?$/,
			use: {
				loader: "babel-loader",
				options: {
					cacheDirectory: true,
					cacheCompression: false,
				},
			},
		},
		{
			test: /\.wasm$/,
			use: "arraybuffer-loader",
			type: "javascript/auto",
		},
	],
};
config.node = {
	net: "empty",
	fs: "empty",
	tls: "empty",
	dns: "empty",
};
config.resolve = {
	extensions: [".js", ".jsx"],
	alias: {
		linkedlist: `${root}/node_modules/linkedlist/lib/linkedlist.js`,
		img: `${root}/public/img`,
	},
};
config.optimization = {
	minimizer: [new TerserPlugin()],
};

module.exports = config;
