use crate::collections::{Budget, Collaborator, Instruction, InstructionAccount, User};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionAccount<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = budget,
    constraint = account.quantity_of_relations == 0 @ ErrorCode::CantDeleteAccountWithRelations,
    constraint = account.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
  )]
  pub account: Account<'info, InstructionAccount>,
  #[account(
    mut,
    constraint = instruction.workspace == account.workspace @ ErrorCode::InstructionDoesNotBelongToWorkspace
  )]
  pub instruction: Account<'info, Instruction>,
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
      account.workspace.as_ref(),
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
      account.workspace.as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteInstructionAccount>) -> Result<()> {
  msg!("Delete instruction account");
  ctx.accounts.instruction.decrease_account_quantity();
  Ok(())
}
