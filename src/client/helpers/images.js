// @flow strict

import config from "~/config";

const url = `https://${config.host}/public/img`;
const img = __DEV__ ? url : `${__VERSION__}/img`;
export default {
};
