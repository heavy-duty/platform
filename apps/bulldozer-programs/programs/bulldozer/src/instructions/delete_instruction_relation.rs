use crate::collections::InstructionRelation;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionRelation<'info> {
  #[account(mut, has_one = authority, close = authority)]
  pub relation: Account<'info, InstructionRelation>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstructionRelation>) -> ProgramResult {
  msg!("Delete instruction relation");
  Ok(())
}
