import cp from "child_process";

const garbage = [
	"styled_components",
	"ramda",
	"faker",
	"axios",
];

const stubs = [
	"ava",
	"axios",
];

export default (args) => {
	cp.execSync("flow-typed install");
	for (const x of garbage) {
		cp.execSync(`rm -rf flow-typed/npm/${x}_*`);
	}
	for (const x of stubs) {
		cp.execSync(`flow-typed create-stub ${x}`);
	}
	cp.execSync("flow-typed create-stub delay --typescript --overwrite");
};
