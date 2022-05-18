export const workspaceAnchorTemplate = `[features]
seeds = true

[programs.localnet]
{{#each applications ~}}
{{this.name.snakeCase}} = "{{this.programId}}"
{{/each}}

[registry]
url = "https://anchor.projectserum.com"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "ts-mocha -p ./tsconfig.json -t 1000000 tests/*.spec.ts --parallel"
`;
