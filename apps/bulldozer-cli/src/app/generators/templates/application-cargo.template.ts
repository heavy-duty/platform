export const applicationCargoTemplate = `[package]
name = "{{application.snakeCase}}"
version = "0.1.0"
description = "Created with Anchor"
edition = "2018"

[lib]
crate-type = ["cdylib", "lib"]
name = "{{application.snakeCase}}"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[profile.release]
overflow-checks = true

[dependencies]
anchor-lang = "0.24.2"
`;
