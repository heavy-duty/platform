export const __anchor = `[programs.localnet]
{{applicationName.snakeCase}} = "E4kBuz9gC7T32LBKnH3kscxjay1Y3KqFkXJt8UHq1BN4"

[registry]
url = "https://anchor.projectserum.com"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts --parallel"
`;
