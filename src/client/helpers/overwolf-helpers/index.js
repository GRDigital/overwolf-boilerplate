// @flow strict

import * as R from "ramda";
import type { integer } from "integer.flow";

import { isError, isSome, logger } from "~/helpers";
import { tryBail } from "~/helpers/error-handling.macro";

import * as S from "./bootstrapper-subset";

export const isOverwolf = S.isOverwolf;

type ManifestData = S.ManifestData;
type OverwolfError = $ReadOnly<{|
	+status: "error",
	+reason: string,
|}>;

export const io = S.io;

export type WindowName = S.WindowName;
export const windows = S.windows;

export const extensions = S.extensions;

export type HotkeyName = $Keys<$ElementType<$ElementType<ManifestData, "data">, "hotkeys">>;
export const settings = {
	getHotkey: (name: HotkeyName): Promise<Error | string> => new Promise((resolve) => {
		overwolf.settings.getHotKey(name, ({ status, hotkey }) => {
			if (status === "success") resolve(hotkey);
			else resolve(Error(status));
		});
	}),
	getCurrentOverwolfLanguage: (): Promise<Error | string> => new Promise((resolve) => {
		overwolf.settings.getCurrentOverwolfLanguage(({ status, language }) => {
			if (status === "success") resolve(language);
			else resolve(Error(status));
		});
	}),
};

export const utils = S.utils;

export type RunningGameInfo = $ReadOnly<{|
	+isInFocus: boolean,
	+isRunning: boolean,
	+allowsVideoCapture: boolean,
	+title: string,
	+id: integer,
	+width: integer,
	+height: integer,
	+logicalWidth: integer,
	+logicalHeight: integer,
	+renderers: $ReadOnlyArray<string>,
	+detectedRenderer: string,
	+executionPath: string,
	+sessionId: string,
	+commandLine: string,
|}>;
export const games = {
	getRunningGameInfo: (): Promise<null | RunningGameInfo> => new Promise((resolve) => overwolf.games.getRunningGameInfo(resolve)),
	getGameInfo: async (id: number): Promise<Error | $ReadOnly<{|
		+GameInfoClassID: integer,
		+GameInfoID: integer,
		+ProcessPath: string,
		+LauncherPath: string,
		+LauncherCommandLineParams: string,
		+LastTimeVerified: string,
		+ManuallyAdded: boolean,
		+WasAutoAddedByProcessDetection: boolean,
		+GameInfo: $ReadOnly<{|
			+ID: integer,
			+GameTitle: string,
			+DisplayName: string,
			+ProcessNames: $ReadOnlyArray<string>,
			+LuancherNames: $ReadOnlyArray<string>,
			+CommandLine: null,
			+GameRenderers: integer,
			+ActualDetectedRenderers: integer,
			+FirstGameResolutionHeight: null,
			+FirstGameResolutionWidth: null,
			+GameGenres: string,
			+InjectionDecision: integer,
			+SupportedScheme: ?string,
			+UnsupportedScheme: ?string,
			+LauncherDirectoryRegistryKey: string,
			+LaunchParams: string,
			// ...
		|}>,
	|}>> => {
		const res = await new Promise((resolve) => overwolf.games.getGameInfo(id, resolve));
		if ((res.status === "success") && isSome(res.gameInfo)) return res.gameInfo;
		else return Error(`games.getGameInfo error: ${res.reason}`);
	},
	events: {
		// mixed because the type depends on what game is running -> impossible to properly type
		getInfo: (): Promise<Error | mixed> => new Promise((resolve) => {
			overwolf.games.events.getInfo(({ status, res }) => {
				if (status === "success") resolve(res);
				else resolve(Error(status));
			});
		}),
	},
};

type ProfileData = $ReadOnly<{|
	+status: "success",
	+username: string,
	+userId: string,
	+machineId: string,
	+partnerId: number,
	+channel: string,
|}>;
export const profile = {
	getCurrentUser: (): Promise<Error | ProfileData> => new Promise((resolve) => {
		overwolf.profile.getCurrentUser((res: ProfileData | OverwolfError) => {
			if (res.status === "success") resolve(res);
			else resolve(Error(res.reason));
		});
	}),
	subscriptions: {
		getActivePlans: (): Promise<Error | $ReadOnlyArray<number>> => new Promise((resolve) => {
			overwolf.profile.subscriptions.getActivePlans((res) => {
				if ((res.success === true) && (isSome(res.plans))) resolve(res.plans);
				else resolve(Error(res.error));
			});
		}),
	},
};

const _SimpleIOP = S._SimpleIOP;
export const SimpleIO = {
	LOCALAPPDATA: S.SimpleIO.LOCALAPPDATA,
	COMMONAPPDATA: S.SimpleIO.COMMONAPPDATA,
	listDirectory: (directory: string): Promise<Error | $ReadOnlyArray<$ReadOnly<{| +name: string |}>>> =>
		new Promise(async (resolve) => tryBail(await _SimpleIOP).listDirectory(directory, (status, result) => {
			if (status === true) resolve(JSON.parse(result));
			resolve(Error("unknown listDirectory error"));
		})),
	listenOnFile: async (fileID: string, file: string, skipToEoF: boolean, listener: (string) => void): Promise<Error | void> => {
		const instance = tryBail(await _SimpleIOP);
		// eslint-disable-next-line sonarjs/cognitive-complexity
		return new Promise((resolve) => instance.listenOnFile(fileID, file, skipToEoF, (cbID, status, data) => {
			if (fileID !== cbID) return;
			if (status) {
				instance.onFileListenerChanged.addListener((id, listenStatus, line) => {
					if (!listenStatus) {
						if (line === "Listener Terminated") return;
						logger(`error listening on file ${id}:${line}`, "error");
					}
					if (id !== fileID) return;
					listener(line);
				});
				resolve();
			} else {
				resolve(Error(`something went wrong with ${fileID} ${cbID} ${file}`));
			}
		}));
	},
	stopFileListen: async (fileID: string): Promise<Error | void> => tryBail(await _SimpleIOP).stopFileListen(fileID),
};

export const appFolder: Promise<string> = (async () => {
	// $FlowIgnore
	if (__SERVER__) return Error("can't use appFolder on server");
	if (__DEV__) return `${__ROOT_FOLDER__}\\public\\extension`;
	const [
		manifest,
		localAppData,
	] = await Promise.all([
		extensions.current.getManifest(),
		SimpleIO.LOCALAPPDATA,
	]);
	if (isError(localAppData)) throw localAppData; // eslint-disable-line fp/no-throw
	const UID = manifest.UID;
	const extensionVersion = manifest.meta.version;
	return `${localAppData}\\Overwolf\\Extensions\\${UID}\\${extensionVersion}`;
})();

export const filePickerURLConvert = (url: string): string => R.pipe(
	(x) => x.replace("overwolf-fs://", ""),
	(x) => {
		const drive = x[0];
		const rest = x.substring(2).replace(/\//g, "\\");
		return `${drive}:\\${rest}`;
	},
)(url);

// When overwolf claims to return json it sometimes returns garbage
export const parseCrappy = (json: string) => {
	try {
		return JSON.parse(json);
	} catch (e) {
		logger(`Crappy JSON didn't parse: ${json}`, "error");
		return e;
	}
};

const _UnboundedRequestP = extensions.current.getExtraObject("unbounded-request");
export const request = async (url: string): Promise<Error | string> => {
	const { success, value } = await new Promise(async (resolve) => tryBail(await _UnboundedRequestP).Request(url, resolve));
	if (!success) return Error(`UnboundedRequest.Request failed ${url} because ${value}`);
	return value;
};
export const downloadFile = async (url: string, path: string): Promise<Error | void> => {
	const success = await new Promise(async (resolve) => tryBail(await _UnboundedRequestP).DownloadFile(url, path, resolve));
	if (!success) return Error(`UnboundedRequest.DownloadFile failed ${url}`);
};

const _DllCallP = extensions.current.getExtraObject("dll-call");

export type LogLevel = "error" | "warn" | "info" | "debug" | "trace";
const levels = { error: 1, warn: 2, info: 3, debug: 4, trace: 5 };
export const Logger = {
	HookUp: (): Promise<void> =>
		new Promise(async (resolve) => tryBail(await _DllCallP).logger_hook_up(resolve)),
	Log: (target: string, level: LogLevel, message: string): Promise<void> =>
		new Promise(async (resolve) => tryBail(await _DllCallP).logger_log(target, levels[level], message, resolve)),
};

export const FileReaderWriterP = extensions.current.getExtraObject("file-reader-writer");
export const FileReaderWriter = {
	Open: async (filePath: string, options: $ReadOnly<{|
		+from?: integer,
		+to?: integer,
		+chunkSize?: integer,
		+mode: "Append" | "Create" | "Open",
	|}>): Promise<Error | void> => {
		const res = await new Promise(async (resolve) => tryBail(await FileReaderWriterP).Open(filePath, options, resolve));
		if (res === false) return Error(`FileReaderWriter failed to Open ${filePath} with ${JSON.stringify(options)}`);
		return res;
	},
	Read: (filePath: string): Promise<Error | $ReadOnly<{| +data: string, +done: boolean |}>> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).Read(filePath, resolve)),
	Write: (filePath: string, msg: string): Promise<Error | number> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).Write(filePath, msg, resolve)),
	Close: (filePath: string): Promise<Error | void> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).Close(filePath, resolve)),
	Move: (oldPath: string, newPath: string): Promise<Error | void> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).Move(oldPath, newPath, resolve)),
	MoveDirectory: (oldPath: string, newPath: string): Promise<Error | void> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).MoveDirectory(oldPath, newPath, resolve)),
	Length: (path: string): Promise<Error | number> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).Length(path, resolve)),
	Delete: (path: string): Promise<Error | boolean> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).Delete(path, resolve)),
	DeleteDirectory: (path: string): Promise<Error | void> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).DeleteDirectory(path, resolve)),
	CreateDirectory: (path: string): Promise<Error | void> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).CreateDirectory(path, resolve)),
	SetReadonly: (path: string, status: boolean): Promise<Error | void> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).SetReadonly(path, status, resolve)),
	FileExists: (path: string): Promise<Error | boolean> =>
		new Promise(async (resolve) => tryBail(await FileReaderWriterP).FileExists(path, resolve)),
};
