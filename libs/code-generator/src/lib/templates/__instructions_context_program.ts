export const __instructions_template = `// Aqui pueden ir algunas instrucciones, 
// para el usuario, de manera de guiarlo

use anchor_lang::prelude::*;
{{#each instruction.accounts}}
{{#switch this.data.kind.id}}
{{#case '0'}}
use crate::collections::{{this.data.collection}};
{{/case}}
{{/switch}}
{{/each}}


#[derive(Accounts)]
#[instruction({{#each instruction.arguments}}, {{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}})]
pub struct {{instruction.name.pascalCase}}<'info>{
    #[account(
    {{#each instruction.accounts}}
        {{#if this.data.space}}
        space = {{this.data.space}},
        {{/if}}
        {{#if this.data.payer}}
        payer = {{this.data.payer}},
        {{/if}}
    {{/each}}
    )]

    {{#each instruction.accounts}}
    {{#switch this.data.kind.id}}
    {{#case '0'}}
    pub {{this.data.name.snakeCase}}: Box<Account<'info,{{this.data.collection}}>>,
    {{/case}}
    {{#case '2'}}
    #[account({{this.data.modifier.name}})]
    pub {{this.data.name.snakeCase}}: Signer<'info>,
    {{/case}}
    {{/switch}}
    {{/each}}
}`;
