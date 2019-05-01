// @flow strict

import { action, computed } from "easy-peasy";

export type State = $ReadOnly<{|
	+scale: number,
	+minimised: boolean,
	+gameFocus: boolean,
	+gameRunning: boolean,
	+isRestored: boolean,
	+mainHotkey: string,
	+isSubscribed: boolean,
|}>;
const s: State = {
	scale: 1,
	minimised: false,
	gameFocus: false,
	gameRunning: false,
	isRestored: computed<State, boolean>((x) => !x.minimised && ((x.gameRunning && x.gameFocus) || !x.gameRunning)),
	mainHotkey: "Alt + Q",
	isSubscribed: false,
};

type E<name> = E<name>;

export type Actions = $ReadOnly<{|
	+setScale: (scale: E<"scale">) => void,
	+setMinimised: (minimised: E<"minimised">) => void,
	+setGameFocus: (gameFocus: E<"gameFocus">) => void,
	+setGameRunning: (gameRunning: E<"gameRunning">) => void,
	+setMainHotkey: (mainHotkey: E<"mainHotkey">) => void,
	+setSubscribed: (isSubscribed: boolean) => void,
|}>;
const a = {
	setScale: action<State, E<"scale">>((state, scale) => ({ ...state, scale })),
	setMinimised: action<State, E<"minimised">>((state, minimised) => ({ ...state, minimised })),
	setGameFocus: action<State, E<"gameFocus">>((state, gameFocus) => ({ ...state, gameFocus })),
	setGameRunning: action<State, E<"gameRunning">>((state, gameRunning) => ({ ...state, gameRunning })),
	setMainHotkey: action<State, E<"mainHotkey">>((state, mainHotkey) => ({ ...state, mainHotkey })),
	setSubscribed: action<State, E<"isSubscribed">>((state, isSubscribed) => ({ ...state, isSubscribed })),
};

export default { ...s, ...a };

/* eslint-disable */
/*:: const _: [Actions, State] = [(({}: any): $Diff<$ReadOnly<{| ...State, ...Actions |}>, State>), (({}: any): $Diff<$ReadOnly<{| ...State, ...Actions |}>, Actions>)]; */// flowlint-line unclear-type:off
