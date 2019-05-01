// @noflow
/* eslint-disable no-console, prefer-template, fp/no-throw, sonarjs/no-duplicate-string */

import cp from "child_process";
import fs from "fs";
import semver from "semver";

import { isOk, safe } from "~/helpers";

import { spawn } from "./index";

export default (args) => {
	if (!["major", "minor", "patch"].includes(args[0]))
		throw Error(`major, minor, patch`);

	// step 1 - make sure git is clean and get current git ref
	spawn("git fetch");

	if (cp.execSync("git status --porcelain=v2").toString() !== "")
		throw Error("git not clean");

	const symbolicRef = safe(() => cp.execSync("git symbolic-ref --short HEAD").toString().trim());
	const thisCommit = isOk(symbolicRef) ? symbolicRef : cp.execSync("git rev-parse --short HEAD").toString().trim();

	// step 2 - merge staging -> production
	spawn("git checkout production");
	spawn("git merge staging --no-ff -X theirs");

	const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
	const pkgLock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
	const manifest = JSON.parse(fs.readFileSync("public/extension/manifest.json", "utf8"));

	const version = semver.inc(semver.inc(pkg.version, args[0]), args[0]);
	pkg.manifestVersion = manifest.meta.version;
	pkg.version = version;
	pkgLock.version = version;

	// step 3 - commit new version and precompile tools
	spawn("npm run script precompile-tools");
	fs.writeFileSync("package.json", JSON.stringify(pkg));
	fs.writeFileSync("package-lock.json", JSON.stringify(pkgLock, null, "  ") + "\n");
	spawn("fixpack");
	spawn("git add -A");
	spawn(`git commit -m "${args[0]} version bump"`);
	spawn(`git tag ${version}`);
	spawn(`git push origin --tags`);

	if (cp.execSync("git status --porcelain=v2").toString() !== "")
		throw Error("git not clean");

	// step 3.5 - commit same new version to master
	spawn("git checkout master");
	fs.writeFileSync("package.json", JSON.stringify(pkg));
	fs.writeFileSync("package-lock.json", JSON.stringify(pkgLock, null, "  ") + "\n");
	spawn("fixpack");
	spawn("git add -A");
	spawn(`git commit -m "${args[0]} version bump"`);
	spawn("git push origin master");

	// step 4 - go back to current ref and start deploy
	spawn(`git checkout ${thisCommit}`);
	spawn("git push origin production");
	spawn("pm2 deploy production reload");
};
