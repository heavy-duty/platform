export const instructionTemplate = `use anchor_lang::prelude::*;
{{#eq collections.length 1}}
use crate::collections::{{collections.[0].pascalCase}};
{{/eq}}
{{#gt collections.length 1}}
use crate::collections::{ {{~#each collections}}{{#if @first}}{{else}}, {{/if}}{{this.pascalCase}}{{/each~}} };
{{/gt}}

{{~#if instructionArguments.length}}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct {{instruction.name.pascalCase}}Arguments {
  {{#each instructionArguments}}
  {{this.name.snakeCase}}: {{#switch this.modifier.id}}{{#case null}}{{this.kind.name}}{{/case}}{{#case '0'}}[{{this.kind.name}};{{this.modifier.size}}]{{/case}}{{#case '1'}}Vec<{{this.kind.name}}>{{/case}}{{/switch}},
  {{/each}}
}
{{else~}}

{{/if}}

#[derive(Accounts)]
{{#if instructionArguments.size}}
#[instruction(arguments: {{instruction.name.pascalCase}}Arguments)]
{{/if}}
pub struct {{instruction.name.pascalCase}}<'info>{
  {{#each instructionAccounts ~}}
  {{#switch this.kind.id}}
  {{#case '0'}}
  {{#if this.modifier.name }}
  #[account(
    {{this.modifier.name}},
    {{#eq this.space 0}}
    space = 8,
    {{/eq}}
    {{#gt this.space 0}}
    space = 8 + {{this.space}},
    {{/gt}}
    {{#if this.payer}}
    payer = {{this.payer.snakeCase}},
    {{/if}}
    {{#if this.close}}
    close = {{this.close.snakeCase}},
    {{/if}}
    {{#each this.relations}}
    has_one = {{this.snakeCase}},
    {{/each}}
  )]
  {{/if}}
  pub {{this.name.snakeCase}}: Box<Account<'info,{{this.collection.pascalCase}}>>,
  {{/case}}
  {{#case '1'}}
  {{#if this.modifier.name }}
  #[account({{this.modifier.name}})]
  {{/if}}
  pub {{this.name.snakeCase}}: Signer<'info>,
  {{/case}}{{/switch}}{{/each~}}
  {{#if initializesAccount ~}}
  pub system_program: Program<'info, System>,
  {{else}}
  {{/if }}
}

{{#if instruction.body}}
pub fn handle(ctx: Context<{{instruction.name.pascalCase}}>{{#if instructionArguments.length}}, arguments: {{instruction.name.pascalCase}}Arguments{{/if}}) -> Result<()> {
  {{#each instruction.body}}
  {{{this}}}
  {{/each}}
  Ok(())
}
{{/if}}
`;
