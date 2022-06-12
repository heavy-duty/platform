use crate::collections::{Collaborator, Workspace, WorkspaceStats};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(Accounts)]
pub struct DeleteWorkspace<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = authority,
  )]
  pub workspace: Account<'info, Workspace>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump,
    seeds::program = user_manager_program.key()
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
  #[account(
    mut,
    close = authority,
    seeds = [
      b"workspace_stats".as_ref(),
      workspace.key().as_ref()
    ],
    bump = workspace.workspace_stats_bump,
    constraint = workspace_stats.quantity_of_applications == 0 @ ErrorCode::CantDeleteWorkspaceWithApplications,
    constraint = workspace_stats.quantity_of_collaborators == 1 @ ErrorCode::CantDeleteWorkspaceWithCollaborators,
  )]
  pub workspace_stats: Box<Account<'info, WorkspaceStats>>,
}

pub fn handle(_ctx: Context<DeleteWorkspace>) -> Result<()> {
  msg!("Delete workspace");
  Ok(())
}
