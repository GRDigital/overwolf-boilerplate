// @flow strict

import * as R from "ramda";

import { tryCrash } from "~/helpers/error-handling.macro";

export { default as logger } from "./logger";

export const isError = (x: mixed): boolean %checks => x instanceof Error;
export const isOk = (x: mixed): boolean %checks => !(x instanceof Error);

export const isVoid = (x: mixed): boolean %checks => (x === undefined);
export const isValue = (x: mixed): boolean %checks => (x !== undefined);

export const isNil = (x: mixed): boolean %checks => (x === undefined) || (x === null);
export const isSome = (x: mixed): boolean %checks => (x !== undefined) && (x !== null);

export const isTrue = (x?: null | boolean): boolean %checks => (x === true);
export const isFalse = (x?: null | boolean): boolean %checks => (x === false);

export const G: (typeof window) & (typeof global) = isSome(global) ? global : window;

export const isNaN = (x: number): boolean %checks => ((typeof x) === "number") ?
	G.isNaN(x) :
	(() => { throw Error(`non-number ${x} passed to isNaN`); })(); // eslint-disable-line fp/no-throw

export const is = {
	error: isError,
	ok: isOk,

	void: isVoid,
	value: isValue,

	nil: isNil,
	some: isSome,

	true: isTrue,
	false: isFalse,

	NaN: isNaN,
};

export const splitErrors = <T>(arr: $ReadOnlyArray<Error | T>): [$ReadOnlyArray<Error>, $ReadOnlyArray<T>] => R.reduce(
	(acc, elem) => {
		isError(elem) ? acc[0].push(elem) : acc[1].push(elem);
		return acc;
	},
	[[], []],
	arr,
);

export type Mix<T1: {}, T2: {}, T3 = {}, T4 = {}, T5 = {}, T6 = {}, T7 = {}, T8 = {}> = {|
	...$Exact<T1>,
	...$Exact<T2>,
	...$Exact<T3>,
	...$Exact<T4>,
	...$Exact<T5>,
	...$Exact<T6>,
	...$Exact<T7>,
	...$Exact<T8>,
|};

const noDefaultPatErr = Error("no default pattern");

export const matchValue = <Seq, Res>(sequence: Seq, patterns: $ReadOnlyArray<[Seq, Res]>, defaultPattern?: Res): Res => {
	for (const [pattern, matcher] of patterns) {
		if (R.equals(pattern, sequence)) return matcher;
	}
	if (isSome(defaultPattern)) return defaultPattern;
	else throw noDefaultPatErr; // eslint-disable-line fp/no-throw
};

export const match = <Seq, Res>(sequence: Seq, patterns: $ReadOnlyArray<[(Seq) => boolean, Res]>): Res => {
	for (const [pattern, matcher] of patterns) {
		if (pattern(sequence)) return matcher;
	}
	throw noDefaultPatErr; // eslint-disable-line fp/no-throw
};

export const matchLazy = <Seq, Res>(sequence: Seq, patterns: $ReadOnlyArray<[(Seq) => boolean, () => Res]>): Res => {
	for (const [pattern, matcher] of patterns) {
		if (pattern(sequence)) return matcher();
	}
	throw noDefaultPatErr; // eslint-disable-line fp/no-throw
};

export const matchValueLazy = <Seq, Res>(sequence: Seq, patterns: $ReadOnlyArray<[Seq, () => Res]>, defaultPattern?: () => Res): Res => {
	for (const [pattern, matcher] of patterns) {
		if (R.equals(pattern, sequence)) return matcher();
	}
	if (isSome(defaultPattern)) return defaultPattern();
	else throw noDefaultPatErr; // eslint-disable-line fp/no-throw
};

export type CancellablePromise<+T> = Promise<T | $ReadOnly<{| +cancelled: true |}>> & $ReadOnly<{| +cancel: () => void |}>;
export const cancellable: (<+T>(Promise<T> | T) => CancellablePromise<T>) = (promise) => {
	let cancelled = false; // eslint-disable-line fp/no-let

	const wrapped = (async () => {
		const result = await promise;
		return cancelled ? { cancelled: true } : result;
	})();

	// $FlowIgnore
	wrapped.cancel = () => { cancelled = true; };

	// $FlowIgnore
	return wrapped;
};

type OrError = <T>(T) => Error | T ;

const groupErrorsObj = <T: {}>(obj: $ObjMap<T, OrError>): Error | T => {
	for (const val of Object.values(obj)) {
		if (isError(val)) return val;
	}
	return obj;
};

const groupErrorsArr = <T>(arr: $ReadOnlyArray<Error | T>): Error | $ReadOnlyArray<T> => {
	for (const val of arr) {
		if (isError(val)) return val;
	}
	return (arr: any); // flowlint-line unclear-type:off
};

declare function groupErrors<T: {}>(x: $ObjMap<T, OrError>): Error | T;
declare function groupErrors<T>(x: $ReadOnlyArray<Error | T>): Error | $ReadOnlyArray<T>;
// $FlowIgnore
export const groupErrors = (x) => Array.isArray(x) ? groupErrorsArr(x) : groupErrorsObj(x);

type Cycle<T> = $ReadOnly<{|
	+state: number,
	+items: $ReadOnlyArray<T>,
	+next: () => T,
|}>;

export const cycle = <T>(items: $ReadOnlyArray<T>): Cycle<T> => {
	const c = {
		state: 0,
		items,
		next: (): T => {
			const item = c.items[c.state];
			c.state = (c.state >= c.items.length - 1) ? 0 : c.state + 1;
			return item;
		},
	};

	return c;
};

export type ExtractReturnType<Fn> = $Call<<T>((...Iterable<any>) => T) => T, Fn>; // flowlint-line unclear-type:off

export const some = <T>(x: ?T): Error | T => isNil(x) ? Error("nothing") : x;

declare function safeP<T>(Promise<T>): Promise<Error | T>;
// $FlowIgnore
export const safeP = async (p) => {
	try { return await p; }
	catch (e) { return e; }
};

declare function safe<T>(() => T): Error | T;
// $FlowIgnore
export const safe = (x) => {
	try { return x(); }
	catch (e) { return e; }
};

export const unwrap = <T>(x: Error | T): T => tryCrash(x);

export const unwrapSome = <T>(x: ?T): T => tryCrash(some(x));

export const unreachable = (reason?: string): any => { // flowlint-line unclear-type:off
	throw Error(reason); // eslint-disable-line fp/no-throw
};

export const initializeRustWasm = async (exports: any, factory: any, bytecode: any): any => { // flowlint-line unclear-type:off
	const wasm = await new WebAssembly.compile(bytecode);
	const instance = factory();
	const compiled = await new WebAssembly.instantiate(wasm, instance.imports);
	Object.assign(exports, instance.initialize(compiled)); // eslint-disable-line fp/no-mutating-assign
};
