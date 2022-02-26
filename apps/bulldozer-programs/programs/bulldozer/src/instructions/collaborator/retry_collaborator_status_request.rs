use crate::collections::Collaborator;
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RetryCollaboratorStatusRequest<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    has_one = authority @ ErrorCode::OnlyCollaboratorStatusRequestAuthorCanRetry,
    constraint = collaborator.status == CollaboratorStatus::Rejected { id: 2 } @ ErrorCode::OnlyRejectedCollaboratorStatusRequestsCanBeRetried,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(ctx: Context<RetryCollaboratorStatusRequest>) -> ProgramResult {
  msg!("Retry collaborator status request");
  ctx
    .accounts
    .collaborator
    .change_status(CollaboratorStatus::Pending { id: 0 });
  ctx.accounts.collaborator.bump_timestamp()?;
  Ok(())
}
