// @flow strict

import * as React from "react";
import AsyncLock from "async-lock";
import delay from "delay";
import styled, { css } from "styled-components";

import * as owHelpers from "~/client/helpers/overwolf-helpers";
import { isError, isNil, isOk, isSome, logger } from "~/helpers";
import { tryCrash } from "~/helpers/error-handling.macro";
import { store } from "~/state";
import type { State as LocalData } from "~/state/local-data";

const PLAN_ID = 0;

const lock = new AsyncLock();

// Retarded flow:
// 1. overwolf.games.onGameInfoUpdated -> react to game process info
// 2. owHelpers.games.getRunningGameInfo -> fetch current game process info
// 3. wait for game to be launched
// 4. setFeatures
// 5. wait for success
// 6. overwolf.games.events.onNewEvents
// 7. overwolf.games.events.onInfoUpdates2 -> react to game info
// 8. overwolf.games.events.getInfo -> fetch current game info

const GAME_ID = 0;
const FEATURES = [
];

const setupLocalData = async () => {
	const appFolder = await owHelpers.appFolder;

	const localDataPath = `${appFolder}\\local-data.json`;
	let lastLocalData: LocalData = store.getState().localData; // eslint-disable-line fp/no-let
	store.subscribe(() => { // eslint-disable-line sonarjs/cognitive-complexity
		const currentLocalData: LocalData = store.getState().localData;
		if (currentLocalData !== lastLocalData) {
			logger("SAVING LOCAL DATA");

			lock.acquire("save-local-data", async (done) => {
				await owHelpers.io.writeFile(localDataPath, JSON.stringify(currentLocalData));
				lastLocalData = currentLocalData;
				done();
			});
		}
	});

	const localDataFile: Error | string = await owHelpers.io.readFile(localDataPath);
	if (isError(localDataFile)) {
		await lock.acquire("save-local-data", async (done) => {
			const currentLocalData = store.getState().localData;
			await owHelpers.io.writeFile(localDataPath, JSON.stringify(currentLocalData));
			lastLocalData = currentLocalData;
			done();
		});
		return;
	}
	const localDataParsed = JSON.parse(localDataFile);
	localDataParsed.firstTimeUser = false;
	const localData: LocalData = { ...localDataParsed, currentVersion: __VERSION__ };
	store.dispatch.localData.load(localData);
};

const setupHotkeys = async () => {
	overwolf.settings.registerHotKey("main", (arg) => {
		if (arg.status !== "success") return;
		const minimised = store.getState().minimised;
		store.dispatch.setMinimised(!minimised);
	});

	store.dispatch.setMainHotkey(tryCrash(await owHelpers.settings.getHotkey("main")));

	overwolf.settings.OnHotKeyChanged.addListener((x) => {
		// eslint-disable-next-line sonarjs/no-small-switch
		switch (x.source) {
			case "main": store.dispatch.setMainHotkey(x.hotkey); return;
		}
	});
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const updateInfo = (info: $FlowTODO) => {
};

const handleEvent = (event: $FlowTODO) => {
	logger(event, "trace");
};

type SubscriptionChangedEvent = $ReadOnly<{|
	+plans: $ReadOnlyArray<number>,
|}>;

const subscribeToEverything = () => {
	overwolf.games.events.onError.addListener((i) => logger(`Error: ${JSON.stringify(i)}`, "warn"));
	overwolf.games.events.onInfoUpdates2.addListener((i: $FlowTODO) => {
		// eslint-disable-next-line sonarjs/no-small-switch
		switch (i.feature) {
			case "info": return updateInfo(i.info);
		}
	});
	overwolf.games.events.onNewEvents.addListener(({ events }) => {
		for (const event of events) {
			event.data =  owHelpers.parseCrappy(event.data);
			if (isError(event.data)) continue; // eslint-disable-line no-continue
			handleEvent(event);
		}
	});
	overwolf.games.events.getInfo((info) => {
		logger(`INFO ${JSON.stringify(info)}`);
		if (info.status !== "success" || !info.res) return;
		updateInfo(info.res);
	});
	overwolf.profile.subscriptions.onSubscriptionChanged.addListener((event: SubscriptionChangedEvent) => {
		store.dispatch.setSubscribed(event.plans.includes(PLAN_ID));
	});
};

let featuresStatus: "none" | "in-progress" | "set" = "none"; // eslint-disable-line fp/no-let
const setFeatures = () => {
	logger("SETTING FEATURES");
	const state = store.getState();

	if (!state.gameRunning) {
		if (featuresStatus === "in-progress") {
			featuresStatus = "none";
		}
		return;
	}

	overwolf.games.events.setRequiredFeatures(FEATURES, (info) => {
		if (info.status === "error") {
			setTimeout(setFeatures, 2000);
			return;
		}
		featuresStatus = "set";
		logger("FEATURES SET");

		subscribeToEverything();
	});
};

const updateGameInfo = (status: owHelpers.RunningGameInfo) => {
	const state = store.getState();

	if (status.isInFocus !== state.gameFocus) {
		store.dispatch.setGameFocus(status.isInFocus);
	}

	if (status.isRunning !== state.gameRunning) {
		store.dispatch.setGameRunning(status.isRunning);
	}

	if (status.isRunning && (featuresStatus === "none")) {
		featuresStatus = "in-progress";
		setFeatures();
	}
};

export default async () => {
	await setupLocalData();

	const plans = await owHelpers.profile.subscriptions.getActivePlans();
	store.dispatch.setSubscribed(isOk(plans) && plans.includes(PLAN_ID));

	overwolf.games.onGameInfoUpdated.addListener((info) => {
		if (isNil(info)) return;
		if (isNil(info.gameInfo)) return;
		if (Math.floor(info.gameInfo.id / 10) !== GAME_ID) return;
		updateGameInfo(info.gameInfo);
	});

	// Two of these so the AppWindow gets minimised/maximised instead of MainWindow
	overwolf.windows.onMainWindowRestored.addListener(() => {
		owHelpers.windows.minimize("MainWindow");
		store.dispatch.setMinimised(false);
	});

	await setupHotkeys();

	(async () => {
		await delay(10000);
		const runningGameInfo = await owHelpers.games.getRunningGameInfo();
		logger({ firstInfo: runningGameInfo });
		if (isSome(runningGameInfo)) updateGameInfo(runningGameInfo);
	})();
};
