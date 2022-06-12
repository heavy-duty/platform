use crate::collections::{Collaborator, Workspace, WorkspaceStats};
use crate::enums::CollaboratorStatus;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollaboratorArguments {
  pub is_admin: bool,
}

#[derive(Accounts)]
pub struct CreateCollaborator<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    constraint = workspace.authority == authority.key()
  )]
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

pub fn handle(
  ctx: Context<CreateCollaborator>,
  arguments: CreateCollaboratorArguments,
) -> Result<()> {
  msg!("Create collaborator");
  ctx.accounts.collaborator.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.user.key(),
    CollaboratorStatus::Approved { id: 1 },
    arguments.is_admin,
    *ctx.bumps.get("collaborator").unwrap(),
  );
  ctx.accounts.collaborator.initialize_timestamp()?;
  ctx
    .accounts
    .workspace_stats
    .increase_collaborator_quantity();
  Ok(())
}
