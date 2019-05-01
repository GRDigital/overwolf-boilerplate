import config from "~/config";

import { spawn } from ".";

export default (args) => {
	if ((args.length === 0) || args.includes("cleanup")) {
		spawn(`git clean -dxf -e bundle.js -e extension -e OverwolfBoilerplate-${__APP_VERSION__}-${config.name}.opk`, "public");
	}
	if ((args.length === 0) || args.includes("zip")) {
		spawn("cd public && bestzip ../package.zip . && cd .. && gzip -r -9 -f -k public/ && mv package.zip public/package.zip");
	}
};
