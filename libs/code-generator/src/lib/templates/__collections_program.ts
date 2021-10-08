export const __collections_template = `// So we’re doing something complicated here, 
// long enough that we need
// multiple lines of comments to do it! Hmm,
// hopefully, this comment will
// explain what’s going on.

#[account]
pub struct {{collection.name.pascalCase}} {
    {{#each collection.attributes}}
    pub {{this.data.name.snakeCase}}: {{this.data.kind.name}},
    {{/each}}
}`;
