use crate::collections::{Collaborator, User, Workspace, WorkspaceStats};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateCollaborator<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub user: Box<Account<'info, User>>,
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
    bump = authority_user.bump
  )]
  pub authority_user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      authority_user.key().as_ref(),
    ],
    bump = authority_collaborator.bump,
    constraint = authority_collaborator.is_admin @ ErrorCode::OnlyAdminCollaboratorCanUpdate,
  )]
  pub authority_collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    init,
    payer = authority,
    space = Collaborator::space(),
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref()
    ],
    bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(ctx: Context<CreateCollaborator>) -> Result<()> {
  msg!("Create collaborator");
  ctx.accounts.collaborator.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.user.key(),
    CollaboratorStatus::Approved { id: 1 },
    false,
    *ctx.bumps.get("collaborator").unwrap(),
  );
  ctx.accounts.collaborator.initialize_timestamp()?;
  ctx
    .accounts
    .workspace_stats
    .increase_collaborator_quantity();
  Ok(())
}
