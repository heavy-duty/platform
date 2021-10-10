export const __instructions_template = `// Aqui pueden ir algunas instrucciones, 
// para el usuario, de manera de guiarlo

use anchor_lang::prelude::*;
use crate::collections::Nombre_Coleccion;

#[derive(Accounts)]
#[instruction({{#each instruction.arguments}}, {{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}})]
pub struct {{instruction.name.pascalCase}}<'info>{
    #[account(
        {{#each instruction.accounts}}
        
        {{#if this.space}}
        space = {{this.space}},
        {{/if}}
        {{#if this.payer}}
        payer = authority,
        {{/if}}
        {{/each}}
    )]

    {{#each instruction.accounts}}
    {{#switch this.kind}}
        {{#case '2'}}
        pub {{this.name}}: Box<Account<'info,{{this.collection}}>>,
        {{/case}}
    {{/each}}
}`;
