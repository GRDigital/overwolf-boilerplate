/* eslint-disable */
const { createMacro, MacroError } = require("babel-plugin-macros");
const R = require("ramda");

// TODO: should probably do smth like
// const poop = tryBail(foo());
// ->
// let _ref1;
// try { _ref1 = foo(); } catch (__TRY_MACRO_ERR) { _ref1 = __TRY_MACRO_ERR; }

// this is pretty hellish but idk how to construct ASTs more easily
module.exports = createMacro(({ references, state, babel }) => {
	// references.default means each use of the alleged default export from this module
	// references.<name> is similarly for named imports

	const fixedArrowFunctions = [];
	const fixedArrowFunctionBlocks = [];
	const queriedTransforms = [];

	const replace = (strategy) => (reference) => {
		if (reference.parent.arguments.length > 1) throw new MacroError("can only try one argument");
		const arg = reference.parent.arguments[0];

		const id = reference.parentPath.scope.generateUidIdentifierBasedOnNode(reference.parentPath.node.id);

		const t = babel.types;
		const testNode = t.binaryExpression("instanceof", id, t.identifier("Error"));

		const consequent = (() => {
			switch (strategy) {
				case "bail": return t.returnStatement(id);
				case "crash": return t.throwStatement(id);
				case "ignore": return t.returnStatement();
				default: throw new MacroError("unknown consequent strategy");
			}
		})();

		const declaration = reference.findParent((path) => path && path.isVariableDeclaration());
		const expression = reference.findParent((path) => path && path.isExpressionStatement());
		const arrowMemberExpression = reference.findParent((path) => path && path.isExpression() && path.parentPath.isArrowFunctionExpression());
		const objectExpression = reference.findParent((path) => path && path.isObjectExpression() && path.parentPath.parentPath.isBlockStatement());
		const returnStatement = reference.findParent((path) => path && path.isReturnStatement());

		const interestingNodes = [
			declaration,
			expression,
			arrowMemberExpression,
			objectExpression,
			returnStatement,
		];
		const deepest = R.pipe(
			R.filter((x) => x),
			R.sortBy((x) => x.getAncestry().length),
			R.last,
		)(interestingNodes);

		const varDecl = t.variableDeclaration("const", [t.variableDeclarator(id, arg)]);
		const ifStmt = t.ifStatement(testNode, consequent);
		reference.parentPath.replaceWith(id);

		if (objectExpression === deepest) {
			if (objectExpression.parentPath.isArrowFunctionExpression()) {
				const fixedId = fixedArrowFunctions.indexOf(objectExpression);
				if (fixedId < 0) {
					fixedArrowFunctions.push(objectExpression);
					const block = t.blockStatement([varDecl, ifStmt, t.returnStatement(objectExpression.parent.body)]);
					fixedArrowFunctionBlocks.push(block);
					queriedTransforms.push(() => objectExpression.get("body").parentPath.replaceWith(block));
				} else {
					const block = fixedArrowFunctionBlocks[fixedId];
					block.body = [...block.body.slice(0, -1), varDecl, ifStmt, block.body[block.body.length - 1]];
				}
			} else {
				objectExpression.parentPath.insertBefore(varDecl);
				objectExpression.parentPath.insertBefore(ifStmt);
			}
		} else if (arrowMemberExpression === deepest) {
			const block = t.blockStatement([varDecl, ifStmt, t.returnStatement(arrowMemberExpression.parent.body)]);
			arrowMemberExpression.get("body").parentPath.replaceWith(block);
		} else {
			const statement = (declaration === deepest) ? declaration : (returnStatement === deepest) ? returnStatement : expression;
			statement.insertBefore(varDecl);
			statement.insertBefore(ifStmt);
		}
	}

	if (references.tryBail) references.tryBail.forEach(replace("bail"));
	if (references.tryCrash) references.tryCrash.forEach(replace("crash"));
	if (references.tryIgnore) references.tryIgnore.forEach(replace("ignore"));

	queriedTransforms.forEach((t) => t());
});
