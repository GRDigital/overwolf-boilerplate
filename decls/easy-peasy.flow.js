// @flow strict

declare module "easy-peasy" {
	declare opaque type Action;
	declare opaque type Thunk;
	// declare opaque type Listen;
	// declare type On = (Action | Thunk, Action | Thunk) => mixed;

	declare export function thunk<State, Actions, Payload, GlobalState, GlobalActions>((Actions, Payload, $ReadOnly<{| +getState: () => State, +getStoreState: () => GlobalState, +dispatch: GlobalActions |}>) => mixed): Thunk;
	declare export function action<State, Payload>((State, Payload) => State): Action;
	declare export function computed<State, Return>((State) => Return): Return;
	declare export function computed<State, Return, GlobalState, T1>([(State, GlobalState) => T1], (T1) => Return): Return;
	declare export function computed<State, Return, GlobalState, T1, T2>([(State, GlobalState) => T1, (State, GlobalState) => T2], (T1, T2) => Return): Return;
	// declare export function listen((On) => mixed): Listen;
	declare export var StoreProvider: any;
	declare export var createStore: any;
	declare export var useStoreActions: any;
	declare export var useStoreState: any;
	declare export function thunkOn(any, any): any;
	declare export function listenOn(any, any): any;
}
