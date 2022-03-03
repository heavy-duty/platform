use crate::collections::{Application, Budget, Collaborator, Instruction, User};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstruction<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = budget,
    constraint = instruction.quantity_of_arguments == 0 @ ErrorCode::CantDeleteInstructionWithArguments,
    constraint = instruction.quantity_of_accounts == 0 @ ErrorCode::CantDeleteInstructionWithAccounts,
    constraint = instruction.application == application.key() @ ErrorCode::InstructionDoesNotBelongToApplication,
  )]
  pub instruction: Account<'info, Instruction>,
  #[account(
    mut,
    constraint = application.workspace == instruction.workspace @ ErrorCode::ApplicationDoesNotBelongToWorkspace
  )]
  pub application: Account<'info, Application>,
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
      instruction.workspace.as_ref(),
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
      instruction.workspace.as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteInstruction>) -> Result<()> {
  msg!("Delete instruction");
  ctx.accounts.application.decrease_instruction_quantity();
  Ok(())
}
