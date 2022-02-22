use crate::collections::{Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateWorkspaceArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateWorkspaceArguments)]
pub struct UpdateWorkspace<'info> {
  #[account(mut)]
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
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved {} @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateWorkspace>, arguments: UpdateWorkspaceArguments) -> ProgramResult {
  msg!("Update workspace");
  ctx.accounts.workspace.rename(arguments.name);
  ctx.accounts.workspace.bump_timestamp()?;
  Ok(())
}
