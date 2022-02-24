use crate::collections::{Budget, Collaborator, Instruction, InstructionArgument, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionArgument<'info> {
  #[account(
    mut,
    close = budget
  )]
  pub argument: Account<'info, InstructionArgument>,
  #[account(
    mut,
    constraint = instruction.key() == argument.instruction @ ErrorCode::InstructionDoesntMatchArgument
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
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
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

pub fn handle(ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
  msg!("Delete instruction argument");
  ctx.accounts.instruction.decrease_argument_quantity();
  Ok(())
}
