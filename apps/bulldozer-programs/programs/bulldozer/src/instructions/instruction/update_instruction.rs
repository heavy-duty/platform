use crate::collections::{Application, Collaborator, Instruction, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionArguments)]
pub struct UpdateInstruction<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace
  )]
  pub application: Box<Account<'info, Application>>,
  #[account(
    mut,
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace,
    constraint = instruction.application == application.key() @ ErrorCode::InstructionDoesNotBelongToApplication,
  )]
  pub instruction: Box<Account<'info, Instruction>>,
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
}

pub fn handle(
  ctx: Context<UpdateInstruction>,
  arguments: UpdateInstructionArguments,
) -> Result<()> {
  msg!("Update instruction");
  ctx.accounts.instruction.rename(arguments.name);
  ctx.accounts.instruction.bump_timestamp()?;
  Ok(())
}
