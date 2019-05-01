// @flow strict

import "core-js/stable";
import "regenerator-runtime/runtime";

import * as R from "ramda";
import * as React from "react";
import delay from "delay";
import preval from "preval.macro";
import ReactDOM from "react-dom";
import io from "socket.io-client";
import { StoreProvider } from "easy-peasy";
import { truncate as int } from "integer.flow";
import { StyleSheetManager } from "styled-components";

import * as owHelpers from "~/client/helpers/overwolf-helpers";
import overwolfSetup from "~/client/overwolf-setup";
import App from "~/components/App";
import config from "~/config";
import { attachOwAd, newAd, type OverwolfAd } from "~/components/Advert";
import { isSome, logger, unwrapSome } from "~/helpers";
import { store } from "~/state";

export const adverts: { [string]: OverwolfAd, ... } = {};

const fetchWindows = async () => {
	try {
		const manifest = await owHelpers.extensions.current.getManifest();
		const windows = await owHelpers.windows.getOpenWindows();
		for (const name of R.keys(manifest.data.windows)) {
			const w = windows[name];
			if (!w || !w.document || !w.document.body || !w.document.head) {
				// logger("windows not ready, waiting....", "warn");
				await delay(250);
				return await fetchWindows();
			}
		}
		return windows;
	} catch (e) {
		await delay(250);
		return await fetchWindows();
	}
};

const windowsSetup = async () => {
	const launchedByGame = isSome(window.location.href.match(/\?source=gamelaunchevent/));
	const windowPs = [];
	if (launchedByGame) {
		store.dispatch.setMinimised(true);
		windowPs.push(owHelpers.windows.hide("AppWindow"));
	} else {
		store.dispatch.setMinimised(false);
		windowPs.push(owHelpers.windows.restore("AppWindow"));
	}

	await Promise.all(windowPs);

	const allWindows = await fetchWindows();
	const windows = R.dissoc("MainWindow", allWindows);
	allWindows.MainWindow.STORE = store;

	for (const name in windows) {
		const w = windows[name];
		w.name = name;
		w.console = console;

		const fonts = w.document.createElement("style");
		fonts.innerHTML = preval`try { module.exports = require("fs").readFileSync("public/extension/fonts.css", "utf8") } catch(e) { }`;
		w.document.head.appendChild(fonts);

		await attachOwAd(w);

		if (__DEV__) {
			let lastkey; // eslint-disable-line fp/no-let
			w.onkeypress = (e) => {
				if ((lastkey === "=") && (e.key === "r")) overwolf.extensions.relaunch();
				if ((lastkey === "=") && (e.key === "q")) window.close();
				lastkey = e.key;
			};
		}
	}

	return windows;
};

const hookupSocket = () => {
	const state = store.getState();

	const socket = io(`https://${config.host}`);
	{
		socket.on("connect", () => {
			socket.emit("uuid", state.localData.uuid);
		});
	}
};

const Window = (p) => {
	const div = p.w.document.createElement("div");
	p.w.document.body.appendChild(div);
	const Portal =  () => ReactDOM.createPortal((<p.e window={p.w}/>), div);
	return (<StyleSheetManager target={p.w.document.head}><Portal/></StyleSheetManager>);
};

(async () => {
	await owHelpers.Logger.HookUp();
	logger("initialised logger", "info");
	const windows = await windowsSetup();
	await overwolfSetup();
	await hookupSocket();

	adverts.main = newAd(windows.AppWindow);

	const app = unwrapSome(document.getElementById("app"));
	app.innerHTML = "";
	app.removeAttribute("style");

	ReactDOM.render((
		<StoreProvider store={store}>
			<React.StrictMode>
				<Window w={windows.AppWindow} e={App}/>
			</React.StrictMode>
		</StoreProvider>
	), app);

	await Promise.all([
		owHelpers.windows.changeSize("MainWindow", int(0), int(0)),
		owHelpers.windows.minimize("MainWindow"),
	]);
})();

window.onerror = (message, source, lineno, colno, error) => {
	logger(`${source}:${lineno} ${message}`, "error");
};
