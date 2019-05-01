// @noflow
/* eslint-disable fp/no-throw */

import cp from "child_process";
import importAll from "import-all.macro";
import R from "ramda";

const scripts = R.pipe(
	R.toPairs,
	R.map(([key, value]) => [key.slice(2, -3), value.default]),
	R.fromPairs,
)(importAll.sync("./!(index).js"));

export const spawn = (cmd, cwd) => {
	process.stdout.write(`> ${cmd}\n\n`);
	cp.execSync(cmd, { stdio: [process.stdin, process.stdout, process.stderr], cwd: (cwd !== undefined) ? cwd : undefined });
	process.stdout.write(`\x1b[42m                                          \x1b[0m\n`);
};

const script = process.argv[2];
const args = process.argv.slice(3);
scripts[script](args);

process.on("unhandledRejection", (up) => { throw up; }); // eslint-disable-line fp/no-throw
