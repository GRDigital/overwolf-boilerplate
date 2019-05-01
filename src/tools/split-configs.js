/* eslint-disable */

const fs = require("fs");
const exec = require("child_process").execSync;
const config = require(`${process.cwd()}/create-configs`);

exec("npm run tool validate-config", { stdio: "inherit" });

const server = JSON.stringify(config.server, null, "	");
const client = JSON.stringify(config.client, null, "	");
config.client = "$CLIENT$";
config.server = "$SERVER$";
const common = JSON.stringify(config, null, "	")
	.replace(`"$CLIENT$"`, "client")
	.replace(`"$SERVER$"`, "server");
const commonFile = `// @flow strict

import server from "~/server/config";
import client from "~/client/config";

export default ${common};`;

const serverFile = `// @flow strict

export default ${server};`;
const clientFile = `// @flow strict

export default ${client};`;

const currentCommon = (() => {
	try { return fs.readFileSync("src/config.js").toString(); } catch (e) { return ""; }
})();
if (currentCommon !== commonFile) fs.writeFileSync("src/config.js", commonFile);

const currentServer = (() => {
	try { return fs.readFileSync("src/server/config.js").toString(); } catch (e) { return ""; }
})();
if (currentServer !== serverFile) fs.writeFileSync("src/server/config.js", serverFile);

const currentClient = (() => {
	try { return fs.readFileSync("src/client/config.js").toString(); } catch (e) { return ""; }
})();
if (currentClient !== clientFile) fs.writeFileSync("src/client/config.js", clientFile);
