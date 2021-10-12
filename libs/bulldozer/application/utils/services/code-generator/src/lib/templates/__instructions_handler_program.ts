export const __instructions_handler_program = `pub fn handler(ctx: Context<{{instruction.name.pascalCase}}>{{#each instruction.arguments}}, {{this.data.name.camelCase}}:{{#switch this.data.modifier.id}}{{#case '0'}}{{this.data.kind.name}}{{/case}}{{#case '1'}}[{{this.data.kind.name}};{{this.data.modifier.size}}]{{/case}}{{#case '2'}}Vec<{{this.data.kind.name}}>{{/case}}{{/switch}}{{/each}}) -> ProgramResult {
  msg!("Body of {{instruction.name.pascalCase}}");

  // your code...

  Ok(())
}`;
