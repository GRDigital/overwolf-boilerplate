/* eslint-disable */

const cp = require("child_process");
const config = require(`${process.cwd()}/create-configs`);

const tool = process.argv[2];
const args = process.argv.slice(3).map((x) => x.replace(/"/g, "\\\"")).join(" ");

if (config.usePrecompiledTools) {
	if (process.platform === "win32") {
		cp.execSync(`tools\\${tool}-windows ${args}`, { stdio: "inherit" });
	} else {
		cp.execSync(`chmod +x tools/${tool}-linux && ./tools/${tool}-linux ${args}`, { stdio: "inherit" });
	}
} else {
	cp.execSync(`cargo run --bin ${tool} --manifest-path tools/Cargo.toml -- ${args}`, { stdio: "inherit" });
}

process.on("unhandledRejection", (up) => { throw up; });
