#![feature(async_closure, proc_macro_hygiene)]

mod config;

use std::collections::HashMap;
use command_macros::command as cmd;
use strum::IntoEnumIterator;
use std::path::{Path, PathBuf};
// use isahc::ResponseExt;
use std::process::Stdio;
use indexmap::map::IndexMap;
use structopt::StructOpt;
use std::io::Write;

#[derive(serde::Deserialize)]
struct RustConfig {
	#[serde(default)]
	libs: Vec<String>,
	#[serde(default)]
	wasms: Vec<String>,
}

#[derive(serde::Deserialize)]
struct CsharpPlugin {
	path: String,
	#[serde(default)]
	system_refs: Vec<String>,
	#[serde(default)]
	package_refs: Vec<String>,
}

#[derive(serde::Deserialize)]
struct CsharpConfig {
	packages: HashMap<String, (String, String)>,
	plugins: HashMap<String, CsharpPlugin>,
}

#[derive(serde::Deserialize)]
struct CompileConfig {
	app_name: String,
	fonts: String,
	to_sign: Vec<String>,
	rust: RustConfig,
	csharp: CsharpConfig,
}

#[derive(Clone, Copy, PartialEq, Eq, Hash, strum::EnumIter, strum::AsRefStr)]
#[allow(non_camel_case_types)]
enum Platform {
	x86,
	x64,
}

fn package_dll(name: &str) -> String {
	let (package_version, cs_version) = &COMPILE_CONFIG.csharp.packages[name];
	format!("plugins/nuget-packages/{}.{}/lib/{}/{}.dll", name, package_version, cs_version, name)
}

fn package_ref(name: &str) -> String { format!("/r:{}", package_dll(name)) }
fn system_ref(name: &str) -> String { format!("/r:{}.dll", name) }
fn rust_target(platform: Platform) -> &'static str { match platform {
	Platform::x86 => "i686-pc-windows-msvc",
	Platform::x64 => "x86_64-pc-windows-msvc",
} }

static NUGET_PATH: &str = "plugins/nuget-packages/nuget.exe";
static CSC_PATH: &str = "plugins/nuget-packages/Microsoft.Net.Compilers.2.8.2/tools/csc.exe";

#[derive(Default)]
struct CompilationStatus {
	error: bool,
	map: IndexMap<&'static str, bool>,
}

fn status_update(f: impl Fn(&mut IndexMap<&'static str, bool>)) {
	let x = &mut STATUS.lock().expect("lock poisoned") as &mut CompilationStatus;
	if x.error { return; }
	let mut out = format!("\x1B[{}A", x.map.keys().count());
	f(&mut x.map);
	for (item, status) in &x.map {
		out.push_str(&format!("\x1B[K{} {}\n", if *status { "✔️" } else { "❌" }, item));
	}
	print!("{}", out);
}

lazy_static::lazy_static! {
	static ref APP_CONFIG: config::Config = serde_json::from_slice(&cmd!(node -e "console.log(JSON.stringify(require('./create-configs.js')))").output().expect("can't execute config").stdout).expect("bad config");
	static ref COMPILE_CONFIG: CompileConfig = toml::from_str(&std::fs::read_to_string("compile-config.toml").expect("can't read config")).expect("bad config");
	static ref APP_VERSION: String = {
		let manifest: serde_json::Value = serde_json::from_str(&std::fs::read_to_string("public/extension/manifest.json").expect("can't read manifest")).expect("bad manifest");
		manifest["meta"]["version"].as_str().expect("missing version in manifest").to_owned()
	};
	static ref STATUS: std::sync::Mutex<CompilationStatus> = std::sync::Mutex::default();
	static ref ARGS: Args = Args::from_args();
}

#[cfg(windows)] fn npx() -> std::process::Command { cmd!(cmd /c npx) }
// #[cfg(windows)] fn npm() -> std::process::Command { cmd!(cmd /c npm) }
#[cfg(unix)] fn npx() -> std::process::Command { cmd!(npx) }
// #[cfg(unix)] fn npm() -> std::process::Command { cmd!(npm) }

#[derive(Debug, structopt::StructOpt)]
struct Args {
	/// compile js for the server
	#[structopt(short = "s", long = "server")]
	with_server: bool,
	/// compile js/cs/rust for the client
	#[structopt(short = "c", long = "client")]
	with_client: bool,
	/// codesign the resulting binaries
	#[structopt(short = "x", long = "sign")]
	with_sign: bool,
}

async fn install_csharp_deps() -> anyhow::Result<()> {
	status_update(|x| { x.insert("install csharp deps", false); });

	// folder where all nuget dependencies go
	std::fs::create_dir_all("plugins/nuget-packages")?;

	if !Path::new(NUGET_PATH).exists() {
		let bytes = reqwest::get("https://dist.nuget.org/win-x86-commandline/latest/nuget.exe").await.and_then(reqwest::Response::error_for_status)?.bytes().await?;
		std::fs::write(NUGET_PATH, bytes)?;
	}

	if !Path::new(CSC_PATH).exists() {
		cmd!((NUGET_PATH) install Microsoft.Net.Compilers -Version 2.8.2 -OutputDirectory plugins/nuget-packages).run()?;
	}

	status_update(|x| { x.insert("install csharp deps", true); });

	Ok(())
}

fn compile_rusts() -> anyhow::Result<()> {
	status_update(|x| { x.insert("rust plugins", false); });
	for project in COMPILE_CONFIG.rust.libs.iter() {
		let toolchain = std::fs::read_to_string(format!("plugins/{}/rust-toolchain", project))?.trim().to_owned();
		for platform in Platform::iter() {
			let target = rust_target(platform);
			let cwd = &format!("plugins/{}", project);

			if !cmd!(rustup run (toolchain)-(target) rustc --version).current_dir(cwd).output()?.status.success() {
				let _ = cmd!(rustup toolchain uninstall (toolchain)-(target)).current_dir(cwd).run();
				let _ = cmd!(rustup install (toolchain)-(target)).current_dir(cwd).run();
			}

			let _ = cmd!(rustup target add (target)).current_dir(cwd).run();
			cmd!(
				rustup run
				(toolchain)-(target)
				cargo rustc
				--lib
				[if !APP_CONFIG.dev { vec!["--release"] } else { vec![] }]
				--target (target)
				--
				--cfg cdylib
			).current_dir(cwd).run()?;

			std::fs::copy(
				PathBuf::new()
					.join("plugins").join(project)
					.join("target").join(target)
					.join(if APP_CONFIG.dev { "debug" } else { "release" })
					.join(format!("{}.dll", project.replace('-', "_"))),
				PathBuf::new()
					.join("public/extension")
					.join(format!("{}{}.dll", project, if platform == Platform::x64 { "64" } else { "" })),
			)?;
		}
	}
	status_update(|x| { x.insert("rust plugins", true); });

	status_update(|x| { x.insert("rust wasms", false); });
	for project in COMPILE_CONFIG.rust.wasms.iter() {
		let cwd = &format!("plugins/{}", project);
		let toolchain = std::fs::read_to_string(format!("plugins/{}/rust-toolchain", project))?.trim().to_owned();

		if !cmd!(rustup run (toolchain) rustc --version).current_dir(cwd).output()?.status.success() {
			let _ = cmd!(rustup toolchain uninstall (toolchain)).current_dir(cwd).run();
			let _ = cmd!(rustup install (toolchain)).current_dir(cwd).run();
		}

		let _ = cmd!(rustup target add wasm32-unknown-unknown).current_dir(cwd).run();

		if !cmd!(cargo web -V).current_dir(cwd).output()?.status.success() {
			cmd!(cargo install cargo-web --force --version 0.6.25).current_dir(cwd).run()?;
		}

		cmd!(cargo web build --target-dir (std::env::current_dir().expect("no current dir").join("target")) --runtime library-es6 --release).current_dir(cwd).run()?;
	}
	status_update(|x| { x.insert("rust wasms", true); });

	Ok(())
}

async fn compile_csharps() -> anyhow::Result<()> {
	status_update(|x| { x.insert("csharp", false); });

	install_csharp_deps().await?;

	cmd!(git clean -dxf).current_dir("plugins/dll-call").run()?;
	cmd!(node generate-crap).current_dir("plugins/dll-call").run()?;

	let nuget_downloads = COMPILE_CONFIG.csharp.packages.iter().map(|(dep, (version, _))| {
		cmd!((NUGET_PATH) install (dep) -Version (version) -OutputDirectory plugins/nuget-packages).piped_spawn()
	}).collect::<std::result::Result<Vec<_>, _>>()?;

	for x in nuget_downloads {
		x.wait_carefully()?;
	}

	for package in COMPILE_CONFIG.csharp.packages.keys() {
		std::fs::copy(package_dll(package), format!("public/extension/{}.dll", package))?;
	}

	let csc_compiles = COMPILE_CONFIG.csharp.plugins.iter().map(|(out, plugin)| {
		let _ = cmd!(rm -rf (plugin.path)/obj).run()?;

		Platform::iter().map(move |platform| {
			Ok(cmd!(
				(CSC_PATH)
				-target:library
				-out:public/extension/(out)(if platform == Platform::x64 { "64" } else { "" }).dll
				-platform:(platform.as_ref())
				[if APP_CONFIG.dev {
					vec!["-debug:full".into(), format!("-define:DEBUG;TRACE;{}", platform.as_ref())]
				} else {
					vec!["-debug:pdbonly".into(), format!("-define:TRACE;{}", platform.as_ref()), "-o".into()]
				}]
				[plugin.system_refs.iter().map(|x| system_ref(x))]
				[plugin.package_refs.iter().map(|x| package_ref(x))]
				-recurse:(plugin.path)("/*").cs
			).piped_spawn()?)
		}).collect::<anyhow::Result<Vec<_>>>()
	}).collect::<anyhow::Result<Vec<_>>>()?.into_iter().flatten();

	for process in csc_compiles {
		process.wait_carefully()?;
	}

	status_update(|x| { x.insert("csharp", true); });

	Ok(())
}

// TODO: unretardize so double regexp iter is unnecessary
async fn fetch_fonts() -> anyhow::Result<()> {
	status_update(|x| { x.insert("fetch fonts", false); });

	let css = reqwest::Client::new()
		.request(reqwest::Method::GET, &COMPILE_CONFIG.fonts)
		.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.110 Safari/537.36 Viv/2.7.1628.30")
		.send()
		.await
		.and_then(reqwest::Response::error_for_status)?
		.text()
		.await?;
	let woff_regexp = regex::Regex::new(r"(url\()(.+?woff2)(\))")?;
	let woff_urls = woff_regexp.captures_iter(&css).map(|x| x[2].to_owned()).collect::<Vec<_>>();
	let woff_files = futures::future::join_all(woff_urls.into_iter().map(async move |url| -> anyhow::Result<(String, Vec<u8>)> {
		let x = reqwest::get(&url).await.and_then(reqwest::Response::error_for_status)?.bytes().await?.to_vec();
		Ok((url, x))
	})).await.into_iter().collect::<anyhow::Result<HashMap<_, _>>>()?;
	let base64_css = woff_regexp.replace_all(&css, |caps: &regex::Captures| {
		let (pre, url, post) = (&caps[1], &caps[2], &caps[3]);
		format!("{pre}data:application/font-woff2;charset=utf-8;base64,{data}{post}", pre = pre, data = base64::encode(&woff_files[url]), post = post)
	});
	std::fs::write("public/extension/fonts.css", base64_css.as_bytes())?;

	status_update(|x| { x.insert("fetch fonts", true); });

	Ok(())
}

fn compile_js() -> anyhow::Result<()> {
	status_update(|x| { x.insert("client js", false); });

	for x in vec![
		cmd!({npx()} webpack --mode (if APP_CONFIG.dev { "development" } else { "production" }) --config webpack.bootstrapper.(if APP_CONFIG.dev { "dev" } else { "prod" }).js)
			.env("NODE_ENV", "overwolf")
			.piped_spawn()?,
		cmd!({npx()} webpack --mode (if APP_CONFIG.dev { "development" } else { "production" }) --config webpack.(if APP_CONFIG.dev { "dev" } else { "prod" }).js)
			.env("NODE_ENV", "overwolf")
			.piped_spawn()?,
	].into_iter() {
		x.wait_carefully()?;
	}

	status_update(|x| { x.insert("client js", true); });

	Ok(())
}

fn codesign() -> anyhow::Result<()> {
	status_update(|x| { x.insert("codesign", false); });
	for name in &COMPILE_CONFIG.to_sign {
		cmd!(signtool sign /f user.pfx /p (std::env::var("PFXPASS").expect("no pfx password")) public/extension/(name)).run()?;
	}
	status_update(|x| { x.insert("codesign", true); });

	Ok(())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
	status_update(|x| { x.insert("everything", false); });

	let rusts = std::thread::spawn(move || -> anyhow::Result<()> {
		if !ARGS.with_client { return Ok(()); }
		compile_rusts()
	});
	let csharps = std::thread::spawn(move || -> anyhow::Result<()> {
		if !ARGS.with_client { return Ok(()); }
		tokio::runtime::Runtime::new()?.block_on(compile_csharps())?;
		Ok(())
	});

	cmd!(node src/tools/split-configs.js).run()?;

	let server_js = std::thread::spawn(move || -> anyhow::Result<()> {
		if !ARGS.with_server { return Ok(()); }
		status_update(|x| { x.insert("server js", false); });
		cmd!({npx()} babel src --out-dir lib --source-maps --copy-files).env("NODE_ENV", "server").run()?;
		status_update(|x| { x.insert("server js", true); });
		Ok(())
	});

	cmd!(git clean -dxf -e bundle.js -e extension -e package.zip -e (COMPILE_CONFIG.app_name)-(*APP_VERSION)-(APP_CONFIG.name).opk).current_dir("public").run()?;
	if ARGS.with_client {
		fetch_fonts().await?;
	}

	let client_js = std::thread::spawn(move || -> anyhow::Result<()> {
		if !ARGS.with_client { return Ok(()); }
		compile_js()
	});

	rusts.join().expect("rust compilation panicked").expect("rust compilation failed");
	csharps.join().expect("csharp compilation panicked").expect("csharp compilation failed");
	client_js.join().expect("client js compilation panicked").expect("client js compilation failed");

	if ARGS.with_client {
		if !APP_CONFIG.dev {
			cmd!(rm -rf ("public/extension/*.pdb") ("public/extension/**/*.pdb")).run()?;
		}
		if ARGS.with_sign {
			codesign()?;
		}

		cmd!({npx()} bestzip ../(COMPILE_CONFIG.app_name)-(*APP_VERSION)-(APP_CONFIG.name).opk *).current_dir("public/extension").run()?;
	}

	server_js.join().expect("server compilation panicked").expect("server compilation failed");

	status_update(|x| { x.insert("everything", true); });

	Ok(())
}

trait CommandExt {
	fn piped_spawn(&mut self) -> std::io::Result<std::process::Child>;
	fn run(&mut self) -> std::io::Result<std::process::Output>;
}

impl CommandExt for std::process::Command {
	fn piped_spawn(&mut self) -> std::io::Result<std::process::Child> {
		self.stderr(Stdio::piped()).stdout(Stdio::piped()).spawn()
	}

	fn run(&mut self) -> std::io::Result<std::process::Output> {
		let out = self.output()?;
		if out.status.success() {
			Ok(out)
		} else {
			STATUS.lock().expect("lock poisoned").error = true;
			std::io::stdout().write_all(&out.stdout)?;
			std::io::stdout().write_all(&out.stderr)?;
			Err(std::io::Error::new(std::io::ErrorKind::Other, "command failed"))
		}
	}
}

trait ChildExt {
	fn wait_carefully(self) -> std::io::Result<std::process::Output>;
}

impl ChildExt for std::process::Child {
	fn wait_carefully(self) -> std::io::Result<std::process::Output> {
		let out = self.wait_with_output()?;
		if out.status.success() {
			Ok(out)
		} else {
			STATUS.lock().expect("lock poisoned").error = true;
			std::io::stdout().write_all(&out.stdout)?;
			std::io::stdout().write_all(&out.stderr)?;
			Err(std::io::Error::new(std::io::ErrorKind::Other, "command failed"))
		}
	}
}
