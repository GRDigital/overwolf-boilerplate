#![feature(proc_macro_hygiene)]

mod config;

use command_macros::command as cmd;

fn main() {
	let _: config::Config = serde_json::from_slice(&cmd!(node -e "console.log(JSON.stringify(require('./create-configs.js')))").output().expect("can't execute config").stdout).expect("bad config");
}
