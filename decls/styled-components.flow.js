declare module "styled-components" {
	declare type SFC<P> = React$StatelessFunctionalComponent<P> & string;
	declare type StyledLiteral = SFC<any>;
	declare module.exports: {
		<P>(cmp: React$StatelessFunctionalComponent<P> | string): ($ReadOnlyArray<string>, ...$ReadOnlyArray<string | ($ReadOnly<{| ...P, ...$ReadOnly<{| +theme: any |}> |}>) => string>) => SFC<P>,
		createGlobalStyle: ($ReadOnlyArray<string>, ...$ReadOnlyArray<string | () => string>) => SFC<{||}>,
		ServerStyleSheet: any,
		StyleSheetManager: any,
		css: <P>($ReadOnlyArray<string>, ...$ReadOnlyArray<string | ($ReadOnly<{| ...P, ...$ReadOnly<{| +theme: any |}> |}>) => string>) => string,
		[string]: <P>($ReadOnlyArray<string>, ...$ReadOnlyArray<string | ($ReadOnly<{| ...P, ...$ReadOnly<{| +theme: any |}> |}>) => string>) => SFC<P>,
		ThemeProvider: React$StatelessFunctionalComponent<$ReadOnly<{| +theme: any, +children: React$Node |}>>,
		ThemeContext: any,
	};
}
