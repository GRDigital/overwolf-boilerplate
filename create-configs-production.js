module.exports = {
	appName: "OverwolfBoilerplate",
	name: "production",
	dev: false,
	host: "<DOMAIN NAME>",
	ssl: true,
	useOwAds: true,
	usePrecompiledTools: true,
	server: {
		cert: "/root/cfcert.pem",
		key: "/root/cfprivkey.pem",
	},
	client: {
	},
};
