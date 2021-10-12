export const __instructions_context_program = `use anchor_lang::prelude::*;
{{#eq collections.length 1}}
use crate::collections::{{collections.[0].data.name.pascalCase}};
{{/eq}}
{{#gt collections.length 1}}
use crate::collections::{ {{~#each collections}}{{#if @first}}{{else}}, {{/if}}{{this.data.name.pascalCase}}{{/each~}} };
{{/gt}}

#[derive(Accounts)]
{{#if instruction.arguments.length}}
#[instruction({{#each instruction.arguments}}{{#if @first}}{{else}}, {{/if}}{{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}})]
{{/if}}
pub struct {{instruction.name.pascalCase}}<'info>{
  {{#each instruction.accounts}}
  {{#switch this.data.kind.id}}
  {{#case '0'}}
  {{#if this.data.modifier.name }}
  #[account(
    {{this.data.modifier.name}},
    {{#if this.data.space}}
    space = 8 + {{this.data.space}},
    {{/if}}
    {{#if this.data.payer}}
    payer = {{this.data.payer.data.name.snakeCase}},
    {{/if}}
    {{#if this.data.close}}
    close = {{this.data.close.data.name.snakeCase}},
    {{/if}}
    {{#each this.data.relations}}
    has_one = {{this.data.to.data.name.snakeCase}},
    {{/each}}
  )]
  {{/if}}
  pub {{this.data.name.snakeCase}}: Box<Account<'info,{{this.data.collection.data.name.pascalCase}}>>,
  {{/case}}
  {{#case '2'}}
  {{#if this.data.modifier.name }}
  #[account(
    {{this.data.modifier.name}},
    {{#if this.data.space}}
    space = 8 + {{this.data.space}},
    {{/if}}
    {{#if this.data.payer}}
    payer = {{this.data.payer.data.name.snakeCase}},
    {{/if}}
    {{#each this.data.relations}}
    has_one = {{this.data.to.data.name.snakeCase}},
    {{/each}}
  )]
  {{/if}}
  pub {{this.data.name.snakeCase}}: Signer<'info>,
  {{/case}}
  {{#case '1'}}
  {{#if this.data.modifier.name }}
  #[account(
    {{this.data.modifier.name}}
  )]
  {{/if}}
  pub {{this.data.name.snakeCase}}: Program<'info, System>,
  {{/case}}{{/switch}}{{/each}}
}

{{#if instruction.handler}}
pub fn handler(ctx: Context<{{instruction.name.pascalCase}}>{{#each instruction.arguments}}, {{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}}) -> ProgramResult {
  {{#each instruction.handler}}
  {{{this}}}
  {{/each}}
  Ok(())
}
{{/if}}
`;
