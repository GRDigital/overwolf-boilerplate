import axios from "axios";

import { safeP } from "~/helpers";

export default (args) => {
	safeP(axios({
		method: "POST",
		url: "SLACK URL HOOK",
		data: {
			text: args.join(" "),
		},
	}));
};
