export const __full_program = `use anchor_lang::prelude::*;

mod collections;
mod instructions;

use instructions::*;

declare_id!("{{application.id}}");

#[program]
pub mod {{application.name.snakeCase}} {
  use super::*;

  {{#each application.instructions}}
  pub fn {{this.name.snakeCase}}(ctx: Context<{{this.name.pascalCase}}>{{#each this.arguments}}, {{this.name.snakeCase}}: {{#switch this.data.modifier.id}}{{#case null}}{{this.data.kind.name}}{{/case}}{{#case '0'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '1'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}}) -> ProgramResult {
    instructions::{{this.name.snakeCase}}::handle(ctx{{#each this.arguments}}, {{this.name.camelCase}}{{/each}})
  }
  {{/each}}
}`;
