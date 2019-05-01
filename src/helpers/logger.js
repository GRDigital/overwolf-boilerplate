// @flow strict

import * as owHelpers from "~/client/helpers/overwolf-helpers";
import { isSome, unwrapSome } from "~/helpers";

/* eslint-disable no-console */
const fns = {
	error: console.error,
	warn: console.warn,
	debug: console.debug,
	info: console.log,
	trace: console.debug,
};
/* eslint-enable no-console */

export default <T>(message: T, kind: owHelpers.LogLevel = "debug", stringify?: boolean): T => {
	if (__SERVER__) {
		fns[kind](new Date(), message);
	} else if (__DEV__) {
		owHelpers.Logger.Log("js", kind, isSome(message) ? unwrapSome(JSON.stringify(message)) : "undefined");
		fns[kind](new Date(), message);
	} else {
		owHelpers.Logger.Log("js", kind, isSome(message) ? unwrapSome(JSON.stringify(message)) : "undefined");
	}
	return message;
};
