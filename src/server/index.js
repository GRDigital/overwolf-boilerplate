// @flow strict

import "core-js/stable";
import "regenerator-runtime/runtime";

import BodyParser from "body-parser";
import compression from "compression";
import CookieParser from "cookie-parser";
import cors from "cors";
import staticGZ from "express-static-gzip";
import fs from "fs";
import http from "http";
import https from "https";
import Socket from "socket.io";
import Express, { type $Request as Request, type $Response as Response, type NextFunction as Next } from "express";

import config from "~/config";
import { logger } from "~/helpers";

const app = Express();
const key = fs.readFileSync(config.server.key);
const cert = fs.readFileSync(config.server.cert);
// $FlowBug
const httpsServer = https.createServer({ key, cert }, app);
const io = Socket(httpsServer);
const sockets = {};

// eslint-disable-next-line sonarjs/cognitive-complexity
(() => {
	app.use(cors());
	app.use("/favicon.ico", Express.static("public/favicon.ico"));

	if (__DEV__) {
		app.use("/public", Express.static("public/"));
	} else {
		app.use("/public", staticGZ("public/"));
	}

	app.use(BodyParser.json({ limit: "50mb", type: "application/json" }));
	app.use(CookieParser());
	app.use(compression());

	// Fix annoying trailing slash
	app.use((req: Request, res: Response, next: Next) => {
		if(req.url.substr(-1) === "/" && req.url.length > 1)
			res.redirect(301, req.url.slice(0, -1));
		else
			next();
	});

	app.use("/version", (req: Request, res: Response) => {
		res.send(`["${__APP_VERSION__}", "${__VERSION__}"]`);
	});

	logger(`Listening at https://${config.host}`);

	const server = httpsServer.listen(443);
	http.createServer((req, res) => {
		res.writeHead(301, { "Location": `https://${config.host}${req.url}` });
		res.end();
	}).listen(80);

	process.on("uncaughtException", (err) => {
		logger(err, "error");
		server.close(() => process.exit(1));
	});

	process.on("unhandledRejection", (reason, p) => {
		logger(`Unhandled Rejection at: ${p}, reason: ${reason}`, "error");
		server.close(() => process.exit(2));
	});

	io.on("connect", (socket) => {
		logger(`[Socket] New socket connection`);
		socket.on("uuid", (uuid) => {
			socket.uuid = uuid;
			sockets[uuid] = socket;
			logger({ msg: "[Socket] uuid added", uuid: socket.uuid });
		});
		socket.on("disconnect", () => {
			logger({ msg: "[Socket] DISCONNECT", uuid: socket.uuid });
			if (!socket.uuid) return;
			delete sockets[socket.uuid]; // eslint-disable-line fp/no-delete
		});
	});
})();
