export const __full_program = `use anchor_lang::prelude::*;

declare_id!("{{program.id}}");

#[program]
pub mod {{program.name.pascalCase}} {
    use super::*;

    {{#each program.instructions}}
    pub fn {{this.instruction.data.name.snakeCase}}(ctx: Context<{{this.instruction.data.name.pascalCase}}>{{#each this.iarguments}}, {{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}}) -> ProgramResult {
        instructions::{{this.instruction.data.name.snakeCase}}::handler(ctx{{#each this.iarguments}}, {{this.data.name.camelCase}}{{/each}})
    }
    {{/each}}
}`;
