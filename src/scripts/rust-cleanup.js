import cp from "child_process";
import fs from "fs";

import { spawn } from ".";

export default (args) => {
	spawn("rustup default nightly-x86_64-pc-windows-msvc");
	const activeToolchain = cp.execSync("rustup show active-toolchain").toString().trim();
	const home = cp.execSync("echo %HOME%").toString().trim();
	const rustupPath = `${home}\\.rustup`;
	fs.readdirSync(`${rustupPath}\\toolchains`)
		.filter((toolchain) => toolchain !== activeToolchain)
		.forEach((toolchain) => {
			try { spawn(`rustup toolchain uninstall ${toolchain}`); } catch (e) {}
		});
};
