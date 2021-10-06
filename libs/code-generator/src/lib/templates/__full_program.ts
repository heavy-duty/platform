export const __rust_template = `use anchor_lang::prelude::*;

declare_id!("{{program.id}}");

#[program]
pub mod {{program.name.pascalCase}} {
    use super::*;

    {{#each program.collections}}
    {{#each this.instructions}}
    pub fn {{this.name.snakeCase}}(ctx: Context<{{this.name.pascalCase}}>{{#each this.arguments}}, {{this.data.name.pascalCase}}: {{this.data.kind.name}}{{/each}}) -> ProgramResult {
        // To implement
    }
    {{/each}}
    {{/each}}
}

#[account]
pub struct {{program.name.pascalCase}} {
    pub authority: Pubkey,
    pub count: u64,
    pub name: [u8; 32],
}

{{#each program.collections}}
#[account]
pub struct {{this.name.pascalCase}} {
    pub authority: Pubkey,
    pub bump: u8,
    pub application: Pubkey,

    {{#each this.attributes}}
    pub {{this.data.name.snakeCase}}: {{this.data.kind.name}},
    {{/each}}
}
{{#each this.instructions}}

#[derive(Accounts)]
#[instruction({{#each this.arguments}}{{#if @first}}{{else}}, {{/if}}{{this.data.name.pascalCase}}: {{this.data.kind.name}}{{/each}})]
pub struct {{this.name.pascalCase}}<'info>{
    #[account(
        init
    )]
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>

    //TODO
}
{{/each}}
{{/each}}

`;
