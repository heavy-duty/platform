export const __instructions_template = `use anchor_lang::prelude::*;
{{#each instruction.accounts}}
{{#switch this.data.kind.id}}
{{#case '0'}}
use crate::collections::{{this.data.collection.data.name.pascalCase}};
{{/case}}
{{/switch}}
{{/each}}

#[derive(Accounts)]
#[instruction({{#each instruction.arguments}}{{#if @first}}{{else}}, {{/if}}{{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}})]
pub struct {{instruction.name.pascalCase}}<'info>{
    {{#each instruction.accounts}}
    {{#switch this.data.kind.id}}
    {{#case '0'}}
    {{#if this.data.modifier.name }}
    #[account(
        {{this.data.modifier.name}}
        {{#if this.data.space}}
        space = 8 + {{this.data.space}}, 
        {{/if}}
        {{#if this.data.payer}}
        payer = {{this.data.payer.data.name.camelCase}},
        {{/if}}
    )]
    {{/if}}
    pub {{this.data.name.snakeCase}}: Box<Account<'info,{{this.data.collection.data.name.pascalCase}}>>,
    {{/case}}
    {{#case '2'}}
    {{#if this.data.modifier.name }}
    #[account(
        {{this.data.modifier.name}}
        {{#if this.data.space}}
        space = 8 + {{this.data.space}}, 
        {{/if}}
        {{#if this.data.payer}}
        payer = {{this.data.payer.data.name.camelCase}},
        {{/if}}
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
}`;