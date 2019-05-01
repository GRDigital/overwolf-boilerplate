// @noflow

import fs from "fs";

import { spawn } from ".";

const tools = ["compile", "validate-config"];
export default () => {
	for (const tool of tools) {
		try { spawn("wsl /root/.cargo/bin/rustup target add x86_64-unknown-linux-musl"); } catch (_) {}
		spawn(`wsl /root/.cargo/bin/cargo build --manifest-path tools/Cargo.toml --bin ${tool} --release --target x86_64-unknown-linux-musl`);
		fs.copyFileSync(`tools/target/x86_64-unknown-linux-musl/release/${tool}`, `tools/${tool}-linux`);

		spawn(`cargo build --manifest-path tools/Cargo.toml --bin ${tool} --release --target x86_64-pc-windows-msvc`);
		fs.copyFileSync(`tools/target/x86_64-pc-windows-msvc/release/${tool}.exe`, `tools/${tool}-windows.exe`);
	}
};
