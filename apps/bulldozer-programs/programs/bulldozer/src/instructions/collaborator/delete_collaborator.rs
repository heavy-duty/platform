use crate::collections::{Collaborator, Workspace, WorkspaceStats};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(Accounts)]
pub struct DeleteCollaborator<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut, has_one = workspace, close = authority)]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"workspace_stats".as_ref(),
      workspace.key().as_ref()
    ],
    bump = workspace.workspace_stats_bump,
  )]
  pub workspace_stats: Box<Account<'info, WorkspaceStats>>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = authority_user.bump,
    seeds::program = user_manager_program.key()
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
}

pub fn handle(ctx: Context<DeleteCollaborator>) -> Result<()> {
  msg!("Delete collaborator");
  ctx
    .accounts
    .workspace_stats
    .decrease_collaborator_quantity();
  Ok(())
}
