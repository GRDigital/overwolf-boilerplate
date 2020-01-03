#![allow(dead_code, non_snake_case)]

#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ServerConfig {
	pub cert: String,
	pub key: String,
}

#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ClientConfig {
}

#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
	pub appName: String,
	pub name: String,
	pub dev: bool,
	pub host: String,
	pub ssl: bool,
	pub useOwAds: bool,
	pub usePrecompiledTools: bool,
	pub server: ServerConfig,
	pub client: ClientConfig,
}
