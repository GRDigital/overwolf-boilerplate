// @flow strict

import { createStore, useStoreActions as useActionsUntyped, useStoreState as useStoreUntyped } from "easy-peasy";

import base, { type Actions as baseActions, type State as baseState } from "./base";
import localData, { type Actions as localDataActions, type State as localDataState } from "./local-data";

const model = {
	...base,
	localData,
};

export type Store = $ReadOnly<{|
	+getState: () => State,
	+dispatch: Actions,
	+subscribe: (() => void) => void,
|}>;
export type State = $ReadOnly<{|
	...baseState,
	+localData: localDataState,
|}>;
export type Actions = $ReadOnly<{|
	...baseActions,
	+localData: localDataActions,
|}>;
export const store: Store = createStore(model, { disableImmer: true });
export const useStore: <V>((State) => V) => V = useStoreUntyped;
export const useActions: <V>((Actions) => V) => V = useActionsUntyped;
