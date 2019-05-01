// @flow strict

import * as React from "react";
import qs from "querystring";
import stringify from "safe-stable-stringify";
import useForceUpdate from "use-force-update";
import axios, { type AxiosXHRConfig } from "axios";

import * as owHelpers from "~/client/helpers/overwolf-helpers";
import { cancellable, G, isNil, isOk, isSome, safeP } from "~/helpers";

export const usePrevious = <V>(value: V): V => {
	const ref = React.useRef();
	React.useEffect(() => { ref.current = value; }, [value]);
	return isSome(ref.current) ? ref.current : value;
};

export const useWhyDidYouUpdate = (name: string, props: $ReadOnly<{ ... }>) => {
	const previousProps = React.useRef();

	React.useEffect(() => {
		if (isSome(previousProps.current)) {
			const current = previousProps.current;
			const allKeys = Object.keys({ ...current, ...props });
			const changesObj = {};
			allKeys.forEach((key) => {
				if (current[key] !== props[key]) {
					changesObj[key] = {
						from: current[key],
						to: props[key],
					};
				}
			});

			if (Object.keys(changesObj).length) {
				console.log("[why-did-you-update]", name, changesObj); // eslint-disable-line no-console
			}
		}

		previousProps.current = props;
	}, Object.values(props));
};

/* flowlint unclear-type:off */
export const useEventListener = (eventName: string, handler: (any) => mixed, element: {
	addEventListener: (string, (any) => mixed) => mixed,
	removeEventListener: (string, (any) => mixed) => mixed,
} = G) => {
	const savedHandler = React.useRef();

	React.useEffect(() => {
		savedHandler.current = handler;
	}, [handler]);

	React.useEffect(() => {
		const isSupported = element && element.addEventListener;
		if (!isSupported) return;

		const eventListener = (event) => isSome(savedHandler.current) && savedHandler.current(event);

		element.addEventListener(eventName, eventListener);

		return () => {
			element.removeEventListener(eventName, eventListener);
		};
	}, [eventName, element]);
};
/* flowlint unclear-type:error */

export const useTimer = (callback: () => mixed, delay?: number, repeat?: boolean = false): void => {
	React.useEffect(() => {
		if (isNil(delay)) return;
		if (repeat) {
			const id = setInterval(callback, delay);
			return () => clearInterval(id);
		} else {
			const id = setTimeout(callback, delay);
			return () => clearTimeout(id);
		}
	}, []);
};

/* eslint-disable require-atomic-updates, sonarjs/cognitive-complexity */
type CachedRequestRet<T> =
	| ["none", void, void] // nothing for sure
	| ["pending", ?T, void] // mb cached data
	| ["cancelled", ?T, void] // mb cached data
	| ["success", T, void] // has cached data
	| ["error", ?T, Error] // has error and mb cached data
;
// TODO: absolutely awful holy frick what is this garbage
export const useCachedRequest = <T>(opts: AxiosXHRConfig<any, any>, timeout?: number, unbounded?: boolean = false): CachedRequestRet<T> => { // flowlint-line unclear-type:off
	if (isNil(G.crapCache)) G.crapCache = {};
	const key = stringify(opts);
	if (isNil(G.crapCache[key])) {
		G.crapCache[key] = { status: "none" };
	}

	const makeCancel = unbounded ? () => {
		let cancelled: boolean = false; // eslint-disable-line fp/no-let
		return {
			cancelled: () => cancelled,
			cancel: () => cancelled = true,
		};
	} : axios.CancelToken.source;

	const forceUpdate = useForceUpdate();

	const load = async () => {
		G.crapCache[key].status = "pending";

		// mb the component wishes to indicate that there's loading going on even if data is available
		forceUpdate();

		if (unbounded) {
			const cancel = G.crapCache[key].cancel;
			const res = await owHelpers.request(`${opts.url}?${qs.stringify(opts.params)}`);
			G.crapCache[key].cancel = makeCancel();

			if (cancel.cancelled()) G.crapCache[key] = { ...G.crapCache[key], status: "cancelled" };
			else if (isOk(res)) G.crapCache[key] = { ...G.crapCache[key], status: "success", data: res };
			else G.crapCache[key] = { ...G.crapCache[key], status: "error", error: res };
		} else {
			const res = await safeP(axios({ ...opts, cancelToken: G.crapCache[key].cancel.token }));
			G.crapCache[key].cancel = makeCancel();

			if (axios.isCancel(res)) G.crapCache[key] = { ...G.crapCache[key], status: "cancelled" };
			else if (isOk(res)) G.crapCache[key] = { ...G.crapCache[key], status: "success", data: res.data };
			else G.crapCache[key] = { ...G.crapCache[key], status: "error", error: res };
		}

		forceUpdate();
	};

	useTimer(() => {
		if (G.crapCache[key].status === "pending") return;
		load();
	}, timeout, true);

	React.useEffect(() => {
		if (
			// hasn't started yet
			(G.crapCache[key].status === "none") ||
			// was unmounted somehow
			(G.crapCache[key].status === "pending") ||
			// was cancelled by unmounting or smth else
			(G.crapCache[key].status === "cancelled")
		) {
			G.crapCache[key] = { ...G.crapCache[key], status: "pending", cancel: makeCancel() };
			load();
		}
		return () => {
			G.crapCache[key].cancel.cancel();
		};
	}, []);

	// $FlowIgnore
	return [G.crapCache[key].status, G.crapCache[key].data, G.crapCache[key].error];
};
/* eslint-enable require-atomic-updates */

export const useCancelAsync = (): typeof cancellable => {
	const toDrop = [];

	React.useEffect(() => () => toDrop.forEach((p) => p.cancel()), []);

	return (p) => {
		const c = cancellable((p: any)); // flowlint-line unclear-type:off
		toDrop.push(c);
		return c;
	};
};
