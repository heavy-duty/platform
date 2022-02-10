use crate::collections::{InstructionAccount, InstructionRelation};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionRelation<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority,
    seeds = [
      b"instruction_relation".as_ref(),
      from.key().as_ref(),
      to.key().as_ref()
    ],
    bump = relation.bump
  )]
  pub relation: Account<'info, InstructionRelation>,
  #[account(mut)]
  pub from: Box<Account<'info, InstructionAccount>>,
  #[account(mut)]
  pub to: Box<Account<'info, InstructionAccount>>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<DeleteInstructionRelation>) -> ProgramResult {
  msg!("Delete instruction relation");
  ctx.accounts.from.quantity_of_relations -= 1;
  ctx.accounts.to.quantity_of_relations -= 1;
  Ok(())
}
