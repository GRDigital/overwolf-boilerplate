import { spawn } from ".";

export default (args) => {
	if ((args.length === 0) || args.includes("flow")) {
		spawn("flow --show-all-errors --show-all-branches");
	}
	if ((args.length === 0) || args.includes("eslint")) {
		spawn(`eslint "src/**/*.js" "src/**/*.jsx"`);
	}
	if ((args.length === 0) || args.includes("css")) {
		spawn(`stylelint "src/**/*.js" "src/**/*.jsx"`);
	}
};
