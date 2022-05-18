export const applicationTemplate = `use anchor_lang::prelude::*;

mod collections;
mod instructions;

use instructions::*;

declare_id!("{{programId}}");

#[program]
pub mod {{application.snakeCase}} {
  use super::*;

  {{#each instructions}}
  pub fn {{this.name.snakeCase}}(ctx: Context<{{this.name.pascalCase}}>{{#if this.quantityOfArguments}}, arguments: {{this.name.pascalCase}}Arguments{{/if}}) -> Result<()> {
    instructions::{{this.name.snakeCase}}::handle(ctx{{#if this.quantityOfArguments}}, arguments{{/if}})
  }
  
  {{/each}}
}`;
