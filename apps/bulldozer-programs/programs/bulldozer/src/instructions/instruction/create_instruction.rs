use crate::collections::{Application, Instruction, Workspace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionArguments)]
pub struct CreateInstruction<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + application
        // name (size 32 + 4 ?) + body + quantity of arguments
        // quantity of accounts + created at + updated at
        space = 8 + 32 + 32 + 32 + 33 + 2000 + 1 + 1 + 8 + 8
    )]
  pub instruction: Box<Account<'info, Instruction>>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handle(ctx: Context<CreateInstruction>, arguments: CreateInstructionArguments) -> ProgramResult {
  msg!("Create instruction");
  ctx.accounts.instruction.authority = ctx.accounts.authority.key();
  ctx.accounts.instruction.workspace = ctx.accounts.workspace.key();
  ctx.accounts.instruction.application = ctx.accounts.application.key();
  ctx.accounts.instruction.name = arguments.name;
  ctx.accounts.instruction.body = "".to_string();
  ctx.accounts.instruction.quantity_of_arguments = 0;
  ctx.accounts.instruction.quantity_of_accounts = 0;
  ctx.accounts.application.quantity_of_instructions += 1;
  ctx.accounts.instruction.created_at = ctx.accounts.clock.unix_timestamp;
  ctx.accounts.instruction.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
