const assert = require("assert");
const version = require("./package.json").version;
const appVersion = require("./public/extension/manifest.json").meta.version;
const config = require("./create-configs");

module.exports = (api) => {
	assert(config !== undefined);
	assert(typeof config.dev === "boolean");
	const server = api.env("server");
	const overwolf = api.env("overwolf");
	const rootFolder = config.dev ? process.cwd() : "";

	return {
		compact: true,
		comments: false,
		minified: true,
		plugins: [
			["babel-plugin-root-import", {
				paths: [{
					rootPathPrefix: "~",
					rootPathSuffix: "src",
				}],
			}],
			["inline-replace-variables", {
				__DEV__: config.dev,
				__SERVER__: server,
				__VERSION__: version,
				__APP_VERSION__: appVersion,
				__ROOT_FOLDER__: rootFolder,
			}],
			"@babel/plugin-proposal-optional-chaining",
			"babel-plugin-transform-line",
			"macros",
			["styled-components", { pure: true }],
		],
		presets: [
			"@babel/preset-flow",
			"@babel/preset-react",
			["@babel/preset-env", {
				targets: server ? { node: "current" } : overwolf ? { chrome: 71 } : { browsers: ["last 2 versions"] },
			}],
		],
	};
};
