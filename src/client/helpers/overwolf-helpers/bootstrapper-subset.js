// @flow strict

import type { integer } from "integer.flow";

import { tryBail } from "~/helpers/error-handling.macro";

export const isOverwolf = (!__SERVER__ && (typeof overwolf !== "undefined"));

// TODO: fix/append
export type ManifestData = $ReadOnly<{|
	+"manifest_version": number,
	+"type": string,
	+"UID": string,
	+"meta": $ReadOnly<{|
		+"name": string,
		+"version": string,
		+"minimum-overwolf-version": string,
		+"author": string,
		+"icon": string,
		+"icon_gray": string,
		+"launcher_icon": string,
		+"description": string,
	|}>,
	+"permissions": $ReadOnlyArray<string>,
	+"data": {
		+"start_window": string,
		+"windows": $ReadOnly<{|
			[string]: $ReadOnly<{|
				+"file": string,
				+"transparent": boolean,
				+"resizable": boolean,
				+"show_in_taskbar": ?boolean,
				+"block_top_window_navigation": ?boolean,
				+"popup_blocker": ?boolean,
				+"mute": ?boolean,
				+"clickthrough": boolean,
				+"grab_keyboard_focus": ?boolean,
				+"grab_focus_on_desktop": ?boolean,
				+"focus_game_takeover": string,
				+"min_size": $ReadOnly<{| +"width": number, +"height": number |}>,
				+"max_size": $ReadOnly<{| +"width": number, +"height": number |}>,
			|}>,
		|}>,
		"hotkeys": $ReadOnly<{|
			[string]: $ReadOnly<{|
				+"title": string,
				+"action-type": string,
				+"default": string,
			|}>,
		|}>,
		"launch_events": $ReadOnlyArray<$ReadOnly<{|
			+"event": string,
			+"event_data": $ReadOnly<{|
				+"game_ids": $ReadOnlyArray<number>,
			|}>,
			+"start_minimized": boolean,
			+"include_launchers": boolean,
		|}>>,
		+"game_targeting": $ReadOnly<{|
			+"type": string,
			+"game_ids": $ReadOnlyArray<number>,
		|}>,
		+"game_events": $ReadOnlyArray<{||}>,
		+"extra-objects": $ReadOnly<{|
			[string]: $ReadOnly<{|
				+"file": string,
				+"class": string,
			|}>,
		|}>,
	},
|}>;

export const utils = {
	openFilePicker: (arg: string): Promise<Error | string> => new Promise((resolve) => {
		overwolf.utils.openFilePicker(arg, (res) => {
			if (res.status === "success") resolve(res.url);
			else resolve(Error(res.reason));
		});
	}),
	getMonitorsList: (): Promise<$ReadOnlyArray<$ReadOnly<{|
		+name: string,
		+id: string,
		+x: integer,
		+y: integer,
		+width: integer,
		+height: integer,
		+is_primary: boolean,
		+handle: $ReadOnly<{| +value: integer |}>,
	|}>>> => new Promise((resolve) => {
		overwolf.utils.getMonitorsList((res) => resolve(res.displays));
	}),
	getFromClipboard: (): Promise<string> => new Promise((resolve) => overwolf.utils.getFromClipboard(resolve)),
	placeOnClipboard: (data: string) => overwolf.utils.placeOnClipboard(data),
};

export type ExtensionName = $Keys<$ElementType<$ElementType<ManifestData, "data">, "extra-objects">>;
export const extensions = {
	current: {
		getExtraObject: (name: ExtensionName): Promise<Error | $ReadOnly<{| [string]: any |}>> => new Promise((resolve) => { // flowlint-line unclear-type:off
			if (!isOverwolf) return Error("not overwolf");
			overwolf.extensions.current.getExtraObject(name, ({ status, object }) => {
				if (status === "success") resolve(object);
				else resolve(Error(status));
			});
		}),
		getManifest: (): Promise<ManifestData> => new Promise((resolve) => overwolf.extensions.current.getManifest(resolve)),
	},
};

export const _SimpleIOP = extensions.current.getExtraObject("simple-io-plugin");
export const SimpleIO = {
	LOCALAPPDATA: (async (): Promise<Error | string> => tryBail(await _SimpleIOP).LOCALAPPDATA)(),
	COMMONAPPDATA: (async () => tryBail(await _SimpleIOP).COMMONAPPDATA)(),
};

opaque type WindowID = string;
export type WindowName = $Keys<$ElementType<$ElementType<ManifestData, "data">, "windows">>;
export const windows = {
	obtainDeclaredWindow: (name: WindowName): Promise<Error | typeof window> => new Promise((resolve) => {
		overwolf.windows.obtainDeclaredWindow(name, (w) => {
			if (w.status === "success") {
				resolve(w.window);
			}
			else resolve(Error(w.status));
		});
	}),
	changeSize: async (name: WindowName, width: integer, height: integer): Promise<Error | void> => {
		const w = tryBail(await windows.obtainDeclaredWindow(name));
		return new Promise((resolve) => overwolf.windows.changeSize(w.id, width, height, resolve));
	},
	changePosition: async (name: WindowName, x: integer, y: integer): Promise<Error | void> => {
		const w = tryBail(await windows.obtainDeclaredWindow(name));
		return new Promise((resolve) => overwolf.windows.changePosition(w.id, x, y, resolve));
	},
	getOpenWindows: (): Promise<$ReadOnly<{| [WindowName]: typeof window |}>> => new Promise(overwolf.windows.getOpenWindows),
	hide: async (name: WindowName): Promise<Error | void> => {
		const w = tryBail(await windows.obtainDeclaredWindow(name));
		return new Promise((resolve) => overwolf.windows.hide(w.id, resolve));
	},
	restore: async (name: WindowName): Promise<Error | void> => {
		const w = tryBail(await windows.obtainDeclaredWindow(name));
		return new Promise((resolve) => overwolf.windows.restore(w.id, resolve));
	},
	minimize: async (name: WindowName): Promise<Error | void> => {
		const w = tryBail(await windows.obtainDeclaredWindow(name));
		return new Promise((resolve) => overwolf.windows.minimize(w.id, resolve));
	},
};

export const io = {
	writeFile: (path: string, contents: string): Promise<Error | void> => new Promise((resolve) => {
		overwolf.io.writeFileContents(path, contents, overwolf.io.enums.UTF8, false, ({ status }) => {
			if (status === "success") resolve();
			else resolve(Error(status));
		});
	}),
	readFile: (path: string): Promise<Error | string> => new Promise((resolve) => {
		overwolf.io.readFileContents(path, overwolf.io.enums.UTF8, ({ status, content, reason }) => {
			if (status === "success") resolve(content);
			else resolve(Error(reason));
		});
	}),
	fileExists: (path: string): Promise<boolean> => new Promise((resolve) => {
		overwolf.io.fileExists(path, ({ status, found }) => {
			if ((status === "success") && found) resolve(true);
			else resolve(false);
		});
	}),
};
