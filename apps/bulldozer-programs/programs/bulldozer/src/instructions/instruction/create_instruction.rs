use crate::collections::{Application, Instruction, Workspace};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateInstruction<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + application
        // name (size 32 + 4 ?) + body + quantity of arguments
        // quantity of accounts
        space = 8 + 32 + 32 + 32 + 33 + 2000 + 1 + 1
    )]
  pub instruction: Box<Account<'info, Instruction>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstruction>, name: String) -> ProgramResult {
  msg!("Create instruction");
  ctx.accounts.instruction.authority = ctx.accounts.authority.key();
  ctx.accounts.instruction.workspace = ctx.accounts.workspace.key();
  ctx.accounts.instruction.application = ctx.accounts.application.key();
  ctx.accounts.instruction.name = name;
  ctx.accounts.instruction.body = "".to_string();
  ctx.accounts.instruction.quantity_of_arguments = 0;
  ctx.accounts.instruction.quantity_of_accounts = 0;
  Ok(())
}
