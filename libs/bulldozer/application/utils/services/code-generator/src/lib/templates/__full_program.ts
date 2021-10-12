export const __full_program = `use anchor_lang::prelude::*;

mod collections;
mod instructions;

use instructions::*;

declare_id!("{{program.id}}");

#[program]
pub mod {{program.name.pascalCase}} {
    use super::*;

    {{#each program.instructions}}
    pub fn {{this.data.name.snakeCase}}(ctx: Context<{{this.data.name.pascalCase}}>{{#each this.arguments}}, {{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}}) -> ProgramResult {
        instructions::{{this.data.name.snakeCase}}::handler(ctx{{#each this.arguments}}, {{this.data.name.camelCase}}{{/each}})
    }
    {{/each}}
}`;
