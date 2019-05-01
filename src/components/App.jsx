// @flow strict

import * as React from "react";
import styled, { createGlobalStyle, type SFC } from "styled-components";
import { truncate as int } from "integer.flow";

import * as owHelpers from "~/client/helpers/overwolf-helpers";
import { useStore } from "~/state";

const BASE_SIZE = {
	w: 1600,
	h: 800,
};

export const GlobalStyle = createGlobalStyle`
	html, body {
		margin: 0;
		padding: 0;
		border: 0;
		overflow: hidden;
	}

	body {
		padding: 0;
		margin: 0;
	}

	h1, h2, h3, h4, h5, h6, p, th, td, li, dd, dt, ul, ol, blockquote, q, acronym, abbr, a, input, select, textarea {
		margin: 0;
		padding: 0;
		font: normal normal normal 16px/1.25 Arial, Helvetica, sans-serif;
		color: white;
		text-decoration: none;
	}

	img {
		border: none;
	}

	select {
		-webkit-appearance: none;
		background-color: #0000;
		display: block;
		border: 0;
	}

	select:focus {
		outline: 0;
	}

	svg {
		overflow: visible;
	}

	textarea {
		background-color: unset;
		border: unset;
		outline: unset;
		resize: none;
	}

	i, cite, em, var, address, dfn {
		font-style: unset;
	}
`;

const AppContainer: SFC<{| +scale: number, +children: React.Node |}> = styled.div`
	overflow: hidden;
	position: relative;
	width: ${BASE_SIZE.w.toString()}px;
	height: ${BASE_SIZE.h.toString()}px;
	transform: scale(${({ scale }) => scale.toString()});
	transform-origin: top left;
	user-select: none;
`;

export default (p: {| +window: typeof window |}) => {
	const scale = useStore((s) => s.scale);
	const isRestored = useStore((s) => s.isRestored);

	React.useEffect(() => {
		owHelpers.windows.changeSize("AppWindow", int(BASE_SIZE.w * scale), int(BASE_SIZE.h * scale));
	}, [scale]);

	React.useEffect(() => {
		if (isRestored) owHelpers.windows.restore("AppWindow");
		else owHelpers.windows.hide("AppWindow");
	}, [isRestored]);

	React.useEffect(() => {
		(async () => {
			const dpi = p.window.devicePixelRatio;

			const displays = await owHelpers.utils.getMonitorsList();
			const { width, height } = displays.filter((display) => display.is_primary)[0];
			const center = {
				x: int(width * 0.5 - (BASE_SIZE.w * 0.5 * scale * dpi)),
				y: int(height * 0.5 - (BASE_SIZE.h * 0.5 * scale * dpi)),
			};
			owHelpers.windows.changeSize("AppWindow", int(BASE_SIZE.w * scale), int(BASE_SIZE.h * scale));
			owHelpers.windows.changePosition("AppWindow", center.x, center.y);
		})();
	}, []);

	return (
		<>
			<GlobalStyle/>
			<AppContainer scale={scale}>
				<div>Hello</div>
			</AppContainer>
		</>
	);
};
