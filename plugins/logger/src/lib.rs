#![deny(
	rust_2018_idioms,
	unused_must_use,
	bare_trait_objects,
	anonymous_parameters,
	elided_lifetimes_in_paths,
)]
#![warn(
	clippy::all,
	missing_copy_implementations,
	missing_debug_implementations,
	trivial_numeric_casts,
	unused_extern_crates,
	unused_import_braces,
	unused_qualifications,
	unused_results,
	variant_size_differences,
)]
#![allow(
	clippy::empty_line_after_outer_attr,
	clippy::missing_const_for_fn,
	clippy::unreadable_literal,
)]
#![cfg_attr(not(debug_assertions), warn(clippy::use_debug, clippy::print_stdout, clippy::unimplemented))]
#![feature(try_blocks, try_trait)]

use std::os::raw::c_char;
use winapi::{
	shared::{
		minwindef::{BOOL, DWORD, HINSTANCE, LPVOID, TRUE},
	},
	um::winnt,
};
use std::ffi::{CStr, CString};
use simplelog::{WriteLogger, LevelFilter, ConfigBuilder};
use std::convert::TryFrom;
pub use winapi;
use libloading::os::windows::{Library, Symbol};
use lazy_static::lazy_static;

#[derive(Debug)]
pub struct Logger {
	library: Library,
	log_fn: Symbol<extern "C" fn(*const c_char, u32, *const c_char)>,
}

#[cfg(target_arch="x86")]
fn load_lib(app_path: &str) -> Library {
	Library::new(format!("{}\\logger.dll", app_path)).expect("can't load x86 dll")
}

#[cfg(target_arch="x86_64")]
fn load_lib(app_path: &str) -> Library {
	Library::new(format!("{}\\logger64.dll", app_path)).expect("can't load x64 dll")
}

impl Logger {
	pub fn init(app_path: &str) {
		let library = load_lib(app_path);
		((unsafe { library.get(b"hook_up\0") }.expect("missing hook_up fn")) as Symbol<extern "C" fn()>)();
		let me = Self {
			log_fn: unsafe { library.get(b"log\0") }.expect("missing log fn"),
			library,
		};
		log::set_max_level(LevelFilter::max());
		let _ = log::set_boxed_logger(Box::new(me));
	}
}

impl log::Log for Logger {
	fn enabled(&self, _: &log::Metadata<'_>) -> bool { true }
	fn log(&self, record: &log::Record<'_>) {
		let target = CString::new(record.target()).expect("bad target cstring");
		let data = CString::new(format!("{}", record.args())).expect("bad data cstring");
		(self.log_fn)(target.as_ptr(), u32::try_from(record.level() as usize).expect("unreachable"), data.as_ptr());
	}
	fn flush(&self) {}
}

#[derive(serde::Deserialize)]
struct ManifestMeta {
	name: String,
	// version: String,
	// ...
}

#[derive(serde::Deserialize)]
struct Manifest {
	meta: ManifestMeta,
	// ...
}

#[derive(serde::Deserialize)]
struct Package {
	version: String,
	// ...
}

lazy_static! {
	static ref NAME: String = serde_json::from_str::<Manifest>(include_str!("..\\..\\..\\public\\extension\\manifest.json")).expect("bad manifest").meta.name;
	static ref VERSION: String = serde_json::from_str::<Package>(include_str!("..\\..\\..\\package.json")).expect("bad package.json").version;
}

#[cfg(cdylib)]
lazy_static! {
	static ref GUARD: std::sync::RwLock<Option<sentry::internals::ClientInitGuard>> = std::sync::RwLock::new(None);
	static ref INITED: std::sync::atomic::AtomicBool = Default::default();
}

#[cfg(cdylib)]
#[no_mangle]
pub unsafe extern "C" fn hook_up() {
	if INITED.load(std::sync::atomic::Ordering::SeqCst) { return; }
	INITED.store(true, std::sync::atomic::Ordering::SeqCst);

	let localappdata = std::env::var("LOCALAPPDATA").expect("can't find localappdata");

	std::fs::create_dir_all(format!(
		"{}\\Overwolf\\Log\\Apps\\{}\\{}",
		localappdata,
		&NAME as &str,
		&VERSION as &str,
	)).expect("can't ensure directories");

	#[cfg(debug_assertions)]
	let level_filter = LevelFilter::max();

	#[cfg(not(debug_assertions))]
	let level_filter = LevelFilter::Info;

	let logger = WriteLogger::new(
		level_filter,
		ConfigBuilder::new()
			.add_filter_ignore_str("mio")
			.add_filter_ignore_str("tokio")
			.add_filter_ignore_str("hyper")
			.add_filter_ignore_str("want")
			.add_filter_ignore_str("reqwest")
			.build(),
		std::fs::OpenOptions::new()
			.append(true)
			.create(true)
			.open(format!(
				"{}\\Overwolf\\Log\\Apps\\{}\\{}\\{}",
				localappdata,
				&NAME as &str,
				&VERSION as &str,
				chrono::Local::today().format("%m-%d"),
			))
			.expect("can't open file"),
	);

	sentry::integrations::log::init(Some(logger), sentry::integrations::log::LoggerOptions {
		global_filter: Some(level_filter),
		filter: level_filter,
		emit_warning_events: true,
		..Default::default()
	});
	sentry::integrations::panic::register_panic_handler();

	#[cfg(not(debug_assertions))]
	{
		let _ = std::thread::spawn(move || {
			let guard = &mut GUARD.write().unwrap() as &mut Option<sentry::internals::ClientInitGuard>;
			let _ = guard.replace(sentry::init(sentry::ClientOptions {
				dsn: Some(std::str::FromStr::from_str("SENTRY DSN").unwrap()),
				release: Some(format!("{}@{}", &NAME as &str, &VERSION as &str).into()),
				..Default::default()
			}));
		}).join();
	}
}

// TODO: file and line
#[cfg(cdylib)]
#[no_mangle]
pub unsafe extern "C" fn log(target_raw: *const c_char, level_raw: u32, data_raw: *const c_char) {
	let level = std::mem::transmute::<_, log::Level>(level_raw as usize);
	let target = CStr::from_ptr(target_raw).to_str().expect("can't read cstr");
	let data = CStr::from_ptr(data_raw).to_str().expect("can't read cstr");
	log::logger().log(&log::Record::builder().target(target).level(level).args(format_args!("{}", data)).build());
}

pub fn easy_init(hinst: HINSTANCE) {
	let mut name: [u16; 512] = [0; 512];
	let _ = unsafe { winapi::um::libloaderapi::GetModuleFileNameW(hinst, &mut name as *mut [u16] as _, 1024) };
	let full_path = unsafe { widestring::U16CStr::from_ptr_str(&name as _) }.to_string().expect("can't string");
	let path = std::path::Path::new(&full_path).parent().expect("can't find app_folder");
	Logger::init(path.to_str().expect("can't make a str"));
}

#[macro_export]
macro_rules! easy_init {
	() => {
		#[no_mangle]
		#[allow(non_snake_case)]
		pub extern "stdcall" fn DllMain(hinst: $crate::winapi::shared::minwindef::HINSTANCE, call_reason: $crate::winapi::shared::minwindef::DWORD, _: $crate::winapi::shared::minwindef::LPVOID) -> $crate::winapi::shared::minwindef::BOOL {
			if let $crate::winapi::um::winnt::DLL_PROCESS_ATTACH = call_reason {
				$crate::easy_init(hinst);
			}

			$crate::winapi::shared::minwindef::TRUE
		}
	}
}
