use crate::collections::InstructionArgument;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionArgument<'info> {
  #[account(mut, has_one = authority, close = authority)]
  pub argument: Account<'info, InstructionArgument>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
  msg!("Delete instruction argument");
  Ok(())
}
