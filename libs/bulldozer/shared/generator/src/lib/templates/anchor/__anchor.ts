export const __anchor = `[programs.localnet]
{{#each applications}}{{this.name.snakeCase}} = "E4kBuz9gC7T32LBKnH3kscxjay1Y3KqFkXJt8UHq1BN4"{{/each}}

[registry]
url = "https://anchor.projectserum.com"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.spec.ts --parallel"
`;
