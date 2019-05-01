// @flow strict

declare module "~/helpers/error-handling.macro" {
	declare export function tryCrash<Ret, Arg: Error | Ret>(arg: Arg): Ret;
	declare export function tryBail<Ret, Arg: Error | Ret>(arg: Arg): Ret;
	declare export function tryIgnore<Ret, Arg: Error | Ret>(arg: Arg): Ret;
}
