use crate::collections::{Budget, Collaborator, Instruction, InstructionAccount, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionAccount<'info> {
  #[account(
    mut,
    close = budget,
    constraint = account.quantity_of_relations == 0 @ ErrorCode::CantDeleteAccountWithRelations
  )]
  pub account: Account<'info, InstructionAccount>,
  #[account(
    mut,
    constraint = instruction.key() == account.instruction @ ErrorCode::InstructionDoesntMatchAccount
  )]
  pub instruction: Account<'info, Instruction>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub authority: Signer<'info>,
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
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved {} @ ErrorCode::CollaboratorStatusNotApproved,
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

pub fn handle(ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
  msg!("Delete instruction account");
  ctx.accounts.instruction.decrease_account_quantity();
  Ok(())
}
