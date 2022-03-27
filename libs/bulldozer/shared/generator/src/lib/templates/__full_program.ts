export const __full_program = `use anchor_lang::prelude::*;

mod collections;
mod instructions;

use instructions::*;

declare_id!("{{application.id}}");

#[program]
pub mod {{application.name.snakeCase}} {
  use super::*;

  {{#each application.instructions}}
  pub fn {{this.name.snakeCase}}(ctx: Context<{{this.name.pascalCase}}>{{#if this.arguments.length}}, arguments: {{this.name.pascalCase}}Arguments{{/if}}) -> Result<()> {
    instructions::{{this.name.snakeCase}}::handle(ctx{{#if this.arguments.length}}, arguments{{/if}})
  }
  
  {{/each}}
}`;
