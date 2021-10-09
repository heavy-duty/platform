export const __instructions_template = `// Aqui pueden ir algunas instrucciones, 
// para el usuario, de manera de guiarlo

use anchor_lang::prelude::*;
use crate::collections::Nombre_Coleccion;

#[derive(Accounts)]
#[instruction({{#each instruction.arguments}}{{#if @first}}{{else}}, {{/if}}{{this.data.name.camelCase}}: {{this.data.kind.name}}{{/each}})]
pub struct {{instruction.name.pascalCase}}<'info>{
    #[account(

    )]

    //TODO
}`;
