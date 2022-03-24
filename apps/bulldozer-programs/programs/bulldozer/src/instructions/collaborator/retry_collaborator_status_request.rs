use crate::collections::{Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RetryCollaboratorStatusRequest<'info> {
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
    mut,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Rejected { id: 2 } @ ErrorCode::OnlyRejectedCollaboratorStatusRequestsCanBeRetried,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(ctx: Context<RetryCollaboratorStatusRequest>) -> Result<()> {
  msg!("Retry collaborator status request");
  ctx
    .accounts
    .collaborator
    .change_status(CollaboratorStatus::Pending { id: 0 });
  ctx.accounts.collaborator.bump_timestamp()?;
  Ok(())
}
