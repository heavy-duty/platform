use crate::collections::{Collaborator, User, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteWorkspace<'info> {
  #[account(
    mut,
    close = authority,
    constraint = workspace.quantity_of_applications == 0 @ ErrorCode::CantDeleteWorkspaceWithApplications,
    constraint = workspace.quantity_of_collaborators == 1 @ ErrorCode::CantDeleteWorkspaceWithCollaborators,
  )]
  pub workspace: Account<'info, Workspace>,
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
    mut,
    close = authority,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.is_admin @ ErrorCode::OnlyAdminCollaboratorCanUpdate,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(_ctx: Context<DeleteWorkspace>) -> Result<()> {
  msg!("Delete workspace");
  Ok(())
}
