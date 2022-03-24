use crate::collections::{Collaborator, User, Workspace, WorkspaceStats};
use crate::enums::CollaboratorStatus;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RequestCollaboratorStatus<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
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
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
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

pub fn handle(ctx: Context<RequestCollaboratorStatus>) -> Result<()> {
  msg!("Request collaborator status");
  ctx.accounts.collaborator.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.user.key(),
    CollaboratorStatus::Pending { id: 0 },
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
