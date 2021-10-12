export const __collections_program = `use anchor_lang::prelude::*;

#[account]
pub struct {{collection.name.pascalCase}} {
  {{#each collection.attributes}}
  pub {{this.data.name.snakeCase}}: {{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}},
  {{/each}}
}`;
