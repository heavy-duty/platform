export const __rust_template = `use anchor_lang::prelude::*;

declare_id!("{{program.id}}");

#[program]
pub mod {{program.name.pascalCase}} {
    use super::*;

    {{#each program.instructions}}
    pub fn {{this.name.snakeCase}}(ctx: Context<{{this.name.pascalCase}}>{{#each this.arguments}}, {{this.data.name.pascalCase}}: {{this.data.kind.name}}{{/each}}) -> ProgramResult {
        // To implement
    }
    {{/each}}
}

#[account]
pub struct {{program.name.pascalCase}} {

}

{{#each program.instructions}}

#[derive(Accounts)]
#[instruction({{#each this.arguments}}{{#if @first}}{{else}}, {{/if}}{{this.data.name.pascalCase}}: {{this.data.kind.name}}{{/each}})]
pub struct {{this.name.pascalCase}}<'info>{
    #[account(

    )]

    //TODO
}
{{/each}}

{{#each program.collections}}
#[account]
pub struct {{this.name.pascalCase}} {
    {{#each this.attributes}}
    pub {{this.data.name.snakeCase}}: {{this.data.kind.name}},
    {{/each}}
}
{{/each}}
`;
