use crate::collections::{Collaborator, User, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollaborator<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = authority_user.bump
  )]
  pub authority_user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      collaborator.workspace.as_ref(),
      authority_user.key().as_ref(),
    ],
    bump = authority_collaborator.bump,
    constraint = authority_collaborator.is_admin @ ErrorCode::OnlyAdminCollaboratorCanUpdate,
  )]
  pub authority_collaborator: Box<Account<'info, Collaborator>>,
  #[account(mut)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut, has_one = workspace, close = authority)]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(ctx: Context<DeleteCollaborator>) -> Result<()> {
  msg!("Delete collaborator");
  ctx.accounts.workspace.decrease_collaborator_quantity();
  Ok(())
}
