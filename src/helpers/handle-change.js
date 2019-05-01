// @flow strict

import * as React from "react";

export const handleFile = <P, S>(cmp: React.Component<P, S>, field: string) => async (event: SyntheticInputEvent<>) => {
	const promise = new Promise((resolve) => {
		const reader = new FileReader();
		reader.readAsDataURL(event.target.files.item(0));
		// $FlowIgnore
		reader.onload = () => resolve(reader.result.toString().split(",")[1]);
	});
	const file = {
		type: event.target.files.item(0).type,
		data: await promise,
	};
	cmp.setState({ [field]: file });
};

export const handleChange = <P, S>(cmp: React.Component<P, S>, field: string) => (event: SyntheticInputEvent<>) => {
	cmp.setState({ [field]: event.target.value });
};

export default handleChange;
