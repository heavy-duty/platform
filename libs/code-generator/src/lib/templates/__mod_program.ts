export const __mod_program = `{{#each collectionOrInstruction}}
mod {{this.name}};
{{/each}}

{{#each collectionOrInstruction}}
pub use {{this.name}}::*;
{{/each}}
`;
