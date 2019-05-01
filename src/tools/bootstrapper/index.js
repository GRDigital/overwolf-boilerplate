// @flow strict

import delay from "delay";
import { truncate as int } from "integer.flow";

import config from "~/config";
import {
	extensions as owHelpers$extensions,
	io as owHelpers$io,
	SimpleIO as owHelpers$SimpleIO,
	utils as owHelpers$utils,
	windows as owHelpers$windows,
} from "~/client/helpers/overwolf-helpers/bootstrapper-subset";

/* eslint-disable fp/no-throw, require-atomic-updates */
const Status = {
	None: 0,
	Starting: 1,
	Downloading: 2,
	Unpacking: 3,
	Finished: 4,
	Error: 5,
};

type S<T> = $ElementType<typeof Status, T>;

type ProgressUpdate =
	| $ReadOnly<{| +status: S<"None"> |}>
	| $ReadOnly<{| +status: S<"Starting"> |}>
	| $ReadOnly<{| +status: S<"Downloading">, +current: number, +total: number |}>
	| $ReadOnly<{| +status: S<"Unpacking"> |}>
	| $ReadOnly<{| +status: S<"Finished">, +bundle: string |}>
	| $ReadOnly<{| +status: S<"Error">, +message: string |}>
;

const getVersion = async (interval?: number = 2500): Promise<[string, string]> => {
	try {
		const [appVersion, version] = JSON.parse(await (await fetch(`http${config.ssl ? "s" : ""}://${config.host}/version`)).text());
		if (
			!(/\d+\.\d+\.\d+/.test(version)) ||
			!(/\d+\.\d+\.\d+/.test(appVersion))
		) {
			await delay(interval + 2500);
			return await getVersion(interval + 2500);
		}
		return [appVersion, version];
	} catch (e) {
		console.warn(e.message); // eslint-disable-line no-console
		await delay(interval + 2500);
		return await getVersion(interval + 2500);
	}
};

// eslint-disable-next-line sonarjs/cognitive-complexity
(async () => {
	const [
		displays,
		Bootstrapper,
		manifest,
		localAppData,
	] = await Promise.all([
		owHelpers$utils.getMonitorsList(),
		owHelpers$extensions.current.getExtraObject("bootstrapper"),
		owHelpers$extensions.current.getManifest(),
		owHelpers$SimpleIO.LOCALAPPDATA,
		owHelpers$windows.changeSize("MainWindow", int(710), int(435)),
	]);
	if (Bootstrapper instanceof Error) throw Bootstrapper;
	if (localAppData instanceof Error) throw localAppData;

	const dpi = window.devicePixelRatio;
	const { width, height } = displays.filter((display) => display.is_primary)[0];
	const center = {
		x: int(width * 0.5 - 700 * 0.5 * dpi),
		y: int(height * 0.5 - 410 * 0.5 * dpi),
	};
	const app = document.getElementById("app");
	if (!app) throw Error("no app div");
	const scale = 1 / dpi;
	app.style.transform = `scale(${scale})`;
	await owHelpers$windows.changePosition("MainWindow", center.x, center.y);

	const progressBar = document.getElementById("progressBar");
	const progressText = document.getElementById("progressText");
	const infoRight = document.getElementById("infoRight");
	if (!progressBar) throw Error("no progress bar");
	if (!progressText) throw Error("no progress text");
	if (!infoRight) throw Error("no info right");
	if (__DEV__) {
		await getVersion();
		const bundle = await owHelpers$io.readFile(`${__ROOT_FOLDER__}/public/bundle.js`);
		progressBar.style.width = "100%";
		progressText.innerText = "DEV - EXECUTING BUNDLE";
		window.bundle = bundle;
		eval(bundle);
	} else {
		const UID = manifest.UID;
		const extensionVersion = manifest.meta.version;
		const folder = `${localAppData}\\Overwolf\\Extensions\\${UID}\\${extensionVersion}`;
		const [expectedExtensionVersion, expectedVersion] = await getVersion();
		if (expectedExtensionVersion !== __APP_VERSION__) {
			progressBar.style.width = `100%`;
			progressBar.style.background = `linear-gradient(90deg, #c34500 0%, #c34500 100%)`;
			progressText.innerText = `App version mismatch`;
			infoRight.style.visibility = "hidden";
			setTimeout(() => {
				window.close();
			}, 5000);
			return;
		} else {
			Bootstrapper.progressChanged.addListener((update: ProgressUpdate) => {
				switch (update.status) {
					case Status.None:
					case Status.Starting: {
						progressBar.style.width = `0%`;
						progressText.innerText = `0%`;
						infoRight.style.visibility = "hidden";
						return;
					}
					case Status.Downloading: {
						const { current, total } = update;
						const progress = (total > 0) ? ((current / total) * 100).toFixed(2) : 0;
						progressBar.style.width = `${progress}%`;
						progressText.innerText = `${parseInt(progress, 10)}%`;
						infoRight.innerText = `${current}/${total}`;
						return;
					}
					case Status.Unpacking: {
						progressBar.style.width = `100%`;
						progressText.innerText = `UNPACKING...`;
						infoRight.style.visibility = "hidden";
						return;
					}
					case Status.Finished: {
						progressText.innerText = `LOADING...`;
						window.bundle = update.bundle;
						eval(update.bundle);
						return;
					}
					case Status.Error: {
						console.log(update.message); // eslint-disable-line no-console
						progressBar.style.width = "100%";
						progressBar.style.background = "linear-gradient(90deg, #c34500 0%, #c34500 100%)";
						progressText.innerText = "Error";
						infoRight.style.visibility = "hidden";
						return;
					}
					default: {
						(update: empty);
						throw Error("unknown state");
					}
				}
			});
			Bootstrapper.StartDownload(`https://${config.host}/public/package.zip`, folder, expectedVersion);
		}
	}
})();
