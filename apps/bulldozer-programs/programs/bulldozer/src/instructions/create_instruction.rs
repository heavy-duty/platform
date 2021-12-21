use crate::collections::{Application, Instruction, Workspace};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateInstruction<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 2000
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
  ctx.accounts.instruction.name = vectorize_string(name, 32);
  ctx.accounts.instruction.body = Vec::<u8>::new();
  Ok(())
}
