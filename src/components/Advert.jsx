// @flow strict

import * as React from "react";
import delay from "delay";
import styled, { type SFC } from "styled-components";

import * as owHelpers from "~/client/helpers/overwolf-helpers";
import config from "~/config";
import { isNil, isSome } from "~/helpers";
import { useStore } from "~/state";

export type OverwolfAd = $ReadOnly<{|
	+dom: typeof window,
	+alreadyMounted: true,
	+container: HTMLDivElement,
	+instance: typeof OwAd,
	+active: boolean,

	+mount: (HTMLDivElement) => void,
	+unmount: (HTMLDivElement) => void,
|}> | $ReadOnly<{|
	+dom: typeof window,
	+alreadyMounted: false,
	+container: void,
	+instance: void,
	+active: boolean,

	+mount: (HTMLDivElement) => void,
	+unmount: (HTMLDivElement) => void,
|}>;

export const attachOwAd = async (w: typeof window) => {
	// must do it like this because evaling it in strict mode throws an error
	const scriptNode = w.document.createElement("script");
	scriptNode.innerHTML = await owHelpers.request("http://content.overwolf.com/libs/ads/latest/owads.min.js");
	w.document.body.appendChild(scriptNode);
	while (isNil(w.OwAd)) {
		await delay(100);
	}
};

export const newAd = (w: typeof window): OverwolfAd => {
	const o = {
		dom: w,
		alreadyMounted: false,
		container: undefined,
		instance: undefined,
		active: false,

		mount: (element) => {
			// console.log("MOUNT");
			if (o.alreadyMounted) {
				element.appendChild(o.container);
				o.instance.refreshAd();
				o.active = true;
			} else {
				o.container = w.document.createElement("div");
				element.appendChild(o.container);
				o.instance = new w.OwAd(o.container, { size: { width: 400, height: 300 } });
				o.alreadyMounted = true;
				o.active = true;
			}
		},
		unmount: (element) => {
			// console.log("UNMOUNT");
			if (!o.alreadyMounted) return;
			o.instance.removeAd();
			element.removeChild(o.container);
			o.active = false;
		},
	};

	return o;
};

type P = $ReadOnly<{|
	+className?: string,
	+restored: boolean,
	+ad: OverwolfAd,
|}>;
export default (styled((p: P) => {
	const div = React.useRef();
	const isSubscribed = useStore((s) => s.isSubscribed);

	React.useEffect(() => {
		if (!config.useOwAds) return;

		if (isSome(div.current)) {
			const current = div.current;

			if (p.ad.active) {
				p.ad.unmount(current);
			}
		}

		return () => {
			if (!p.ad.active) return;
			if (isNil(div.current)) return;
			const current = div.current;
			p.ad.unmount(current);
		};
	}, []);

	React.useEffect(() => {
		if (!config.useOwAds) return;
		if (!div.current) return;
		const current = div.current;

		if (isSubscribed) {
			if (p.ad.active) {
				p.ad.unmount(current);
			}
			return;
		}

		if (!p.restored && p.ad.active) {
			p.ad.unmount(current);
		} else if (p.restored && !p.ad.active) {
			p.ad.mount(current);
		}
	}, [p.restored, isSubscribed]);

	return (<div className={p.className}><div ref={div}/></div>);
})`
	overflow: hidden;
	width: 400px;
	height: 300px;
	box-sizing: border-box;

	& > div {
		width: 400px;
		height: 300px;
	}
`: SFC<P>);
