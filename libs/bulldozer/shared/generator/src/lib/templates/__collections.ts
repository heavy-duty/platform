export const __collections = `use anchor_lang::prelude::*;

#[account]
pub struct {{collection.name.pascalCase}} {
  {{#each collection.attributes}}
  pub {{this.name.snakeCase}}: {{#switch this.modifier.id}}{{#case null}}{{this.kind.name}}{{/case}}{{#case '0'}}[{{this.kind.name}};{{this.modifier.size}}]{{/case}}{{#case '1'}}Vec<{{this.kind.name}}>{{/case}}{{/switch}},
  {{/each}}
}`;
