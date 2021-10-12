export const __mod_program = `{{#each entries}}
mod {{this.snakeCase}};
{{/each}}

{{#each entries}}
pub use {{this.snakeCase}}::*;
{{/each}}
`;
