use crate::collections::{Budget, Collaborator, InstructionAccount, InstructionRelation, User};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionRelation<'info> {
  pub authority: Signer<'info>,
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
  #[account(
    mut,
    constraint = from.workspace == relation.workspace @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
    constraint = from.application == relation.application @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    constraint = from.instruction == relation.instruction @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
  )]
  pub from: Box<Account<'info, InstructionAccount>>,
  #[account(
    mut,
    constraint = to.workspace == relation.workspace @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
    constraint = to.application == relation.application @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    constraint = to.instruction == relation.instruction @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
  )]
  pub to: Box<Account<'info, InstructionAccount>>,
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
      relation.workspace.as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      relation.workspace.as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteInstructionRelation>) -> Result<()> {
  msg!("Delete instruction relation");
  ctx.accounts.from.decrease_relation_quantity();
  ctx.accounts.to.decrease_relation_quantity();
  Ok(())
}
