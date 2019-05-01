// @flow strict

import faker from "faker";
import { action } from "easy-peasy";

export type State = $ReadOnly<{|
	+firstTimeUser: boolean,
	+firstVersion: string,
	+currentVersion: string,
	+uuid: string,
|}>;
const s: State = {
	firstTimeUser: true,
	firstVersion: __VERSION__,
	currentVersion: __VERSION__,
	uuid: faker.random.uuid(),
};

type E<name> = $ElementType<State, name>;

export type Actions = $ReadOnly<{|
	+load: (data: State) => void,
|}>;
const a = {
	load: action<State, State>((state, data) => ({ ...state, ...data })),
};

export default { ...s, ...a };

/* eslint-disable */
/*:: const _: [Actions, State] = [(({}: any): $Diff<$ReadOnly<{| ...State, ...Actions |}>, State>), (({}: any): $Diff<$ReadOnly<{| ...State, ...Actions |}>, Actions>)]; */// flowlint-line unclear-type:off
