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
1. `npm run flow-typed`
1. `npm run tool compile`
1. `npm run script dev`
1. Open Overwolf, right click on the tray icon -> `Support` -> `Development Options` -> `Load unpacked extension...` -> open the `public/extension` folder -> `Select folder`
1. Click `Launch` next to the package that just appeared

# For dev
* [redux-devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) extension helps with state debugging.
* [node.js inspector manager](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj) will help debuggin serverside code.
* Only the `MainWindow`'s console will be populated with messages. You can copy the url by pressing `Ctrl+D`, copying the url and pasting into a chromium-based browser. This is useful if you want to debug game events since overwolf insists on overlaying the browser on top of the game.
* Editing the js code will recompile the bundle and restart the server. Use `=r` while app is in focus to reload or `=q` to close the app.
* Consult with `npm run script lint eslint` for style consistency and `npm run script lint flow` for type safety (or just `npm run script lint` for both).

# Staging & production
* Make sure the ip and host are correct in `ecosystem.config.js` and `create-configs-*.js`
* Make sure the names are correct in `src/scripts/deploy.js` and `scr/tools/compile.js`
* Create an AWS CodeBuild job
* TODO: how to configure the codebuild job
* Establish `git` branches `staging` and `production`
* Checkout master, make sure it's clean and ready to be merged into `staging`
* `npm run script stage <semver-bump>` and `npm run script production`
