/* eslint-disable prefer-template */
const fs = require("fs");
const createMacro = require("babel-plugin-macros").createMacro;
const parse = require("babylon").parse;

module.exports = createMacro(({ references }) => {
	const { default: toReactComponent = [] } = references;

	toReactComponent.forEach((referencePath) => {
		const svgPath = referencePath.parentPath.get("arguments")[0].node.value;
		const rawSvg = fs.readFileSync(svgPath, "utf8").slice(4);
		const jsCode = "styled((p) => (<svg {...p}" + rawSvg + "))``;";
		const ast = parse(jsCode, { sourceType: "module", plugins: ["jsx"] });
		referencePath.parentPath.replaceWith(ast.program.body[0]);
	});
});
