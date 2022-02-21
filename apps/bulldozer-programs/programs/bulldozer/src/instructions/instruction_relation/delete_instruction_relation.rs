use crate::collections::{
  Budget, Collaborator, InstructionAccount, InstructionRelation, User, Workspace,
};
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
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteInstructionRelation>) -> ProgramResult {
  msg!("Delete instruction relation");
  ctx.accounts.from.decrease_relation_quantity();
  ctx.accounts.to.decrease_relation_quantity();
  Ok(())
}
