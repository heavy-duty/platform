export const __instructions = `use anchor_lang::prelude::*;
{{#eq collections.length 1}}
use crate::collections::{{collections.[0].name.pascalCase}};
{{/eq}}
{{#gt collections.length 1}}
use crate::collections::{ {{~#each collections}}{{#if @first}}{{else}}, {{/if}}{{this.name.pascalCase}}{{/each~}} };
{{/gt}}

#[derive(Accounts)]
{{#if instruction.arguments.length}}
#[instruction({{#each instruction.arguments}}{{#if @first}}{{else}}, {{/if}}{{this.name.camelCase}}: {{#switch this.data.modifier.id}}{{#case null}}{{this.data.kind.name}}{{/case}}{{#case '0'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '1'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}})]
{{/if}}
pub struct {{instruction.name.pascalCase}}<'info>{
  {{#each instruction.accounts}}
  {{#switch this.data.kind.id}}
  {{#case '0'}}
  {{#if this.data.modifier.name }}
  #[account(
    {{this.data.modifier.name}},
    {{#eq this.data.space 0}}
    space = 8,
    {{/eq}}
    {{#gt this.data.space 0}}
    space = 8 + {{this.data.space}},
    {{/gt}}
    {{#if this.data.payer}}
    payer = {{this.data.payer.name.snakeCase}},
    {{/if}}
    {{#if this.data.close}}
    close = {{this.data.close.name.snakeCase}},
    {{/if}}
    {{#each this.data.relations}}
    has_one = {{this.data.toAccount.name.snakeCase}},
    {{/each}}
  )]
  {{/if}}
  pub {{this.name.snakeCase}}: Box<Account<'info,{{this.data.collection.name.pascalCase}}>>,
  {{/case}}
  {{#case '1'}}
  {{#if this.data.modifier.name }}
  #[account({{this.data.modifier.name}})]
  {{/if}}
  pub {{this.name.snakeCase}}: Signer<'info>,
  {{/case}}{{/switch}}{{/each}}
  {{#if instruction.initializesAccount }}
  pub system_program: Program<'info, System>,
  {{/if }}
}

{{#if instruction.handler}}
pub fn handle(ctx: Context<{{instruction.name.pascalCase}}>{{#each instruction.arguments}}, {{this.name.camelCase}}: {{#switch this.data.modifier.id}}{{#case null}}{{this.data.kind.name}}{{/case}}{{#case '0'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '1'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}}) -> Result<()> {
  {{#each instruction.handler}}
  {{{this}}}
  {{/each}}
  Ok(())
}
{{/if}}
`;
