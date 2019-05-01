// @noflow
/* eslint-disable */

const defaults = (env) => ({
	user: "root",
	ssh_options: "StrictHostKeyChecking=no",
	repo: "git@github.com:GRDigital/REPO_CHANGEME.git",
	path: "~/overwolf-boilerplate",
	"post-setup": "sudo apt-get install software-properties-common -y && sudo add-apt-repository ppa:git-core/ppa -y && apt-get update && curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash && sudo apt-get install git-lfs -y",
	"pre-deploy": "git checkout -- .",
	"post-deploy": `git submodule update --init --recursive && git lfs pull && cp create-configs-${env}.js create-configs.js && npm ci --unsafe-perm && npm run tool compile -- --server && npm run script deploy && npx pm2 startOrReload ecosystem.config.js`,
});

module.exports = {
	apps: [{
		name: "overwolf-boilerplate",
		script: "lib/server/index.js",
		instances: 1,
		autorestart: true,
		watch: false,
	}],

	deploy: {
		production: {
			...defaults("production"),
			host: "HOST.IP.ADDRESS.CHANGEME",
			ref: "origin/production",
		},
		staging: {
			...defaults("staging"),
			host: "HOST.IP.ADDRESS.CHANGEME",
			ref: "origin/staging",
		},
	},
};
