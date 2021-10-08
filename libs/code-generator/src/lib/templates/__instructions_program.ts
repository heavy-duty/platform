export const __instructions_template = `// So we’re doing something complicated here, 
// long enough that we need
// multiple lines of comments to do it! Hmm,
// hopefully, this comment will
// explain what’s going on.

#[derive(Accounts)]
#[instruction({{#each instruction.arguments}}{{#if @first}}{{else}}, {{/if}}{{this.data.name.pascalCase}}: {{this.data.kind.name}}{{/each}})]
pub struct {{instruction.name.pascalCase}}<'info>{
    #[account(

    )]

    //TODO
}`;
