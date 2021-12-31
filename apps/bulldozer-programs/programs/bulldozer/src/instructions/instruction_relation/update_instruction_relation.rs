use crate::collections::{InstructionAccount, InstructionRelation};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateInstructionRelation<'info> {
  #[account(mut, has_one = authority)]
  pub relation: Box<Account<'info, InstructionRelation>>,
  pub from: Box<Account<'info, InstructionAccount>>,
  pub to: Box<Account<'info, InstructionAccount>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionRelation>) -> ProgramResult {
  msg!("Update instruction relation");
  ctx.accounts.relation.from = ctx.accounts.from.key();
  ctx.accounts.relation.to = ctx.accounts.to.key();

  Ok(())
}
