use crate::collections::{
  Budget, Collaborator, Instruction, InstructionArgument, InstructionStats, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionArgument<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace
  )]
  pub instruction: Account<'info, Instruction>,
  #[account(
    mut,
    close = budget,
    constraint = argument.workspace == workspace.key() @ ErrorCode::InstructionArgumentDoesNotBelongToWorkspace,
    constraint = argument.instruction == instruction.key() @ ErrorCode::InstructionArgumentDoesNotBelongToInstruction,
  )]
  pub argument: Account<'info, InstructionArgument>,
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
  #[account(
    mut,
    seeds = [
      b"instruction_stats".as_ref(),
      instruction.key().as_ref()
    ],
    bump = instruction.instruction_stats_bump
  )]
  pub instruction_stats: Box<Account<'info, InstructionStats>>,
}

pub fn handle(ctx: Context<DeleteInstructionArgument>) -> Result<()> {
  msg!("Delete instruction argument");
  ctx.accounts.instruction_stats.decrease_argument_quantity();
  Ok(())
}
