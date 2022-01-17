export const __collections = `use anchor_lang::prelude::*;

#[account]
pub struct {{collection.name.pascalCase}} {
  {{#each collection.attributes}}
  pub {{this.name.snakeCase}}: {{#switch this.data.modifier.id}}{{#case null}}{{this.data.kind.name}}{{/case}}{{#case '0'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '1'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}},
  {{/each}}
}`;
