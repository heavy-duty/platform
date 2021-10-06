export const __context_template = `{{#each program.collections}}
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
{{/each}}`;
