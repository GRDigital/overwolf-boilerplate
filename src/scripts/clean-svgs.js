// @noflow
/* eslint-disable no-console, fp/no-let */

import { spawn } from ".";

const icons = [
];

const colouredIcons = [
];

const path = "public/img/icons";

export default (args) => {
	for (let i = 0; i < 3; i += 1) {
		colouredIcons.forEach((icon) => {
			console.log(icon);
			spawn(`svgo --pretty --multipass --config=svgo-keep-colour.yml ${path}/${icon}`);
			spawn(`svgcleaner.exe --allow-bigger-file --multipass --apply-transform-to-paths --indent tabs ${path}/${icon} ${path}/${icon}`);
		});

		icons.forEach((icon) => {
			console.log(icon);
			spawn(`svgo --pretty --multipass --config=svgo.yml ${path}/${icon}`);
			spawn(`svgcleaner.exe --allow-bigger-file --multipass --apply-transform-to-paths --indent tabs ${path}/${icon} ${path}/${icon}`);
		});
	}
};
