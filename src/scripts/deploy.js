import cp from "child_process";
import delay from "delay";

import config from "~/config";

import { spawn } from ".";

export default async (args) => {
	try {
		spawn("check-dependencies");
		const ip = cp.execSync("curl http://169.254.169.254/latest/meta-data/public-ipv4");
		const sha = cp.execSync("git rev-parse HEAD").toString().trim();

		const id = JSON.parse(cp.execSync(`aws codebuild start-build --project-name overwolf-boilerplate --source-version ${sha} --environment-variables-override name=SCP_TARGET,value='${ip}' name=PACKAGE_PATH,value='${process.cwd()}/package.zip' name=NAME,value='${config.name}' --region eu-west-1`).toString()).build.id;
		while (true) {
			const info = JSON.parse(cp.execSync(`aws codebuild batch-get-builds --ids ${id} --region eu-west-1`).toString()).builds[0];
			if (info.buildComplete) {
				if (info.buildStatus !== "SUCCEEDED") {
					throw Error("build boy failed or timed out"); // eslint-disable-line fp/no-throw
				}
				break;
			}
			await delay(15000);
		}
		spawn("rm -rf public");
		spawn(`extract-zip package.zip ${process.cwd()}/public`);
		spawn("mv package.zip public/package.zip");
		spawn(`npm run script deploy-webhook "overwolf-boilerplate deployed @ ${__APP_VERSION__}/${__VERSION__} @ ${config.name}\ndownload: http${config.ssl ? "s" : ""}://${config.host}/public/OverwolfBoilerplate-${__APP_VERSION__}-${config.name}.opk"`);
	} catch (e) {
		spawn(`npm run script deploy-webhook "overwolf-boilerplate build failed @ ${__APP_VERSION__}/${__VERSION__} @ ${config.host} @ ${config.name}\nreason: ${e.toString()}"`);
		throw e; // eslint-disable-line fp/no-throw
	}
};
