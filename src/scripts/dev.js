// @noflow

import { spawn } from "child_process";

import { spawn as spawnSync } from ".";

export default (args) => {
	const has = (x) => (args.length === 0) || args.includes(x);

	spawnSync("check-dependencies");

	const opts = { stdio: "inherit", shell: true };
	if (has("watch")) spawn("cross-env", [
		"NODE_ENV=overwolf",
		"webpack",
		"--mode",
		"development",
		"--config",
		"webpack.dev.js",
		"--watch",
	], opts);

	if (has("server")) spawn("cross-env", [
		"NODE_ENV=server",
		"nodemon",
		"--watch",
		"src",
		"-e",
		"js,json,jsx",
		"--exec",
		"babel-node",
		"--inspect",
		"src/server/index.js",
	], opts);
};
