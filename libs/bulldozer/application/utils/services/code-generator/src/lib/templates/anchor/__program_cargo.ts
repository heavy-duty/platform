export const __program_cargo = `[package]
name = "{{applicationName.snakeCase}}"
version = "0.1.0"
description = "Created with Anchor"
edition = "2018"

[lib]
crate-type = ["cdylib", "lib"]
name = "{{applicationName.snakeCase}}"

[features]
no-entrypoint = []
no-idl = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.17.0"
`;
