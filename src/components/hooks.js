// @flow strict

import * as React from "react";
import { cancellable, G, isNil, isSome } from "~/helpers";

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

export const useCancelAsync = (): typeof cancellable => {
	const toDrop = [];

	React.useEffect(() => () => toDrop.forEach((p) => p.cancel()), []);

	return (p) => {
		const c = cancellable((p: any)); // flowlint-line unclear-type:off
		toDrop.push(c);
		return c;
	};
};
