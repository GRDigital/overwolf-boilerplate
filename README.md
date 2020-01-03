# Prerequisites
1. Windows only
1. `node` v10+ and `npm` v6+ in PATH
1. C++ compiler that `node-gyp` understands
	* make sure to tick C++ and C# if installing Visual Studio
	* also see [windows-build-tools](https://www.npmjs.com/package/windows-build-tools)
	* also see [vs_buildtools.exe](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=15)
1. `python` v2.7 in PATH
	* also see [windows-build-tools](https://www.npmjs.com/package/windows-build-tools)
1. `git` and Unix tools (`rm`, `find`, `gzip`, `mv`, `sh`, etc) in PATH
	* e.g. as part of [Git for Windows](https://git-scm.com/download/win))
	* e.g. as part of [cmder](https://cmder.net)
1. `cargo` and `rustup` in PATH
	* e.g. via [rustup.rs](https://rustup.rs)
1. [Overwolf](https://download.overwolf.com/install/Download?Name=Web+Browser&ExtensionId=jgbnfkaeklillfmfafgkodhlcnfdgkmjmjngaaof&Channel=website)

**CAUTION:** `sh`, `bash`, `cygwin` or even `PowerShell` _may_ cause issues. `ConEmu`/`cmder` is fine.

# Setup
1. Copy `create-configs.js.example` to `create-configs.js` and edit
1. `npm install`
1. `npm run tool compile -- --client` - double-dash necessary because `--client` is an argument to the compile script
1. `npm run script flow-typed`
1. `npm run script dev`
1. Open Overwolf, right click on the tray icon -> `Support` -> `Development Options` -> `Load unpacked extension...` -> open the `public/extension` folder -> `Select folder`
1. Click `Launch` next to the package that just appeared

# For dev
* [node.js inspector manager](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj) will help debuggin serverside code.
* Only the `MainWindow`'s console will be populated with messages.
* Editing the js code will recompile the bundle and restart the server. Use `=r` while app is in focus to reload or `=q` to close the app.
* Consult with `npm run script lint eslint` for style consistency and `npm run script lint flow` for type safety (or just `npm run script lint` for both).

# Staging & production
* Make sure the ip and host are correct in `ecosystem.config.js` and `create-configs-*.js`
* Make sure the names are correct in `tools/compile.rs`, `src/scripts/deploy.js`, `src/scripts/stage.js` and `src/scripts/production.js`
* A docker image for AWS CodeBuild is provided, but has to be uploaded to AWS image store.
	* Something like `docker build -t main -m 4g docker && docker tag main:latest <image-uri>:latest && docker push <image-uri>:latest`
* Create an AWS CodeBuild job
	* TODO: how to configure the codebuild job
* Establish `git` branches `staging` and `production`
* Checkout master, make sure it's clean and ready to be merged into `staging`
* `npm run script stage` and `npm run script production <semver-bump>`
* All the logging done via `logger` (including with plugins) will be redirected to a log file next to Overwolf's app log, all errors will be redirected to Sentry (if set up).
