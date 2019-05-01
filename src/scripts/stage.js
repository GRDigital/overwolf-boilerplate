// @noflow
/* eslint-disable no-console, prefer-template, fp/no-throw */

import cp from "child_process";
import fs from "fs";
import semver from "semver";

import { isOk, isSome, safe } from "~/helpers";

import { spawn } from "./index";

export default (args) => {
	spawn("git fetch");

	if (cp.execSync("git status --porcelain=v2").toString() !== "")
		throw Error("git not clean");

	const symbolicRef = safe(() => cp.execSync("git symbolic-ref --short HEAD").toString().trim());
	const thisCommit = isOk(symbolicRef) ? symbolicRef : cp.execSync("git rev-parse --short HEAD").toString().trim();

	spawn("git checkout staging");
	spawn(`git merge ${thisCommit} --no-ff -X theirs`);

	const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
	const pkgLock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
	const manifest = JSON.parse(fs.readFileSync("public/extension/manifest.json", "utf8"));

	const currentVersion = isSome(pkg.version.match(/\d+\.\d+\.\d+-\d+/)) ? pkg.version : `${pkg.version}-0`;
	const newVersion = semver.inc(currentVersion, "prerelease");
	pkg.manifestVersion = manifest.meta.version;
	pkg.version = newVersion;
	pkgLock.version = newVersion;

	spawn("npm run script precompile-tools");
	fs.writeFileSync("package.json", JSON.stringify(pkg));
	fs.writeFileSync("package-lock.json", JSON.stringify(pkgLock, null, "  ") + "\n");
	spawn("fixpack");
	spawn("git add -A");
	spawn(`git commit -m "staging version bump"`);

	spawn(`git checkout ${thisCommit}`);
	spawn("git push origin staging");
	spawn("pm2 deploy staging reload");
};
