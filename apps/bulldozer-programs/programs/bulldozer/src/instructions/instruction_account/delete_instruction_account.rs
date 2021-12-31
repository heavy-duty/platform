use crate::collections::InstructionAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionAccount<'info> {
  #[account(mut, close = authority, has_one = authority)]
  pub account: Account<'info, InstructionAccount>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
  msg!("Delete instruction account");
  Ok(())
}
