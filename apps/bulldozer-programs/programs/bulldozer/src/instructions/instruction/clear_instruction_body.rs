use crate::collections::{
  Application, Collaborator, Instruction, InstructionChunk, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClearInstructionBody<'info> {
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

pub fn handle(ctx: Context<ClearInstructionBody>) -> Result<()> {
  msg!("Clear instruction body");

  let mut chunks = Vec::new();

  chunks.push(InstructionChunk {
    position: 0,
    data: "".to_string(),
  });
  chunks.push(InstructionChunk {
    position: 1,
    data: "".to_string(),
  });
  chunks.push(InstructionChunk {
    position: 2,
    data: "".to_string(),
  });
  chunks.push(InstructionChunk {
    position: 3,
    data: "".to_string(),
  });

  ctx.accounts.instruction.chunks = chunks;

  Ok(())
}
