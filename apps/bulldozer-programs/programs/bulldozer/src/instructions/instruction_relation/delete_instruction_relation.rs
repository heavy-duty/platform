use crate::collections::{InstructionAccount, InstructionRelation};
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteInstructionRelation<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority
  )]
  pub relation: Account<'info, InstructionRelation>,
  #[account(
    mut,
    constraint = relation.from == from.key() @ ErrorCode::FromDoesntMatchRelation
  )]
  pub from: Box<Account<'info, InstructionAccount>>,
  #[account(
    mut,
    constraint = relation.to == to.key() @ ErrorCode::ToDoesntMatchRelation
  )]
  pub to: Box<Account<'info, InstructionAccount>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<DeleteInstructionRelation>) -> ProgramResult {
  msg!("Delete instruction relation");
  ctx.accounts.from.quantity_of_relations -= 1;
  ctx.accounts.to.quantity_of_relations -= 1;
  Ok(())
}
