rustup target add i686-pc-windows-msvc
rustup target add x86_64-pc-windows-msvc
rustup component add rust-src clippy rustfmt rls-preview rust-analysis
cargo install cargo-play cargo-edit watchexec --force
