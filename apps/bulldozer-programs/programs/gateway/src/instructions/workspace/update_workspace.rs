use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Collaborator, Workspace};
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
pub struct UpdateWorkspace<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub system_program: Program<'info, System>,
  pub gateway: Account<'info, Gateway>,
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump,
    seeds::program = user_manager_program.key()
  )]
  pub user: Account<'info, User>,
  #[account(mut)]
  pub workspace: Account<'info, Workspace>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    seeds::program = workspace_manager_program.key(),
    constraint = collaborator.is_admin @ ErrorCode::OnlyAdminCollaboratorCanUpdate
  )]
  pub collaborator: Account<'info, Collaborator>,
}

pub fn handle(ctx: Context<UpdateWorkspace>, name: String) -> Result<()> {
  msg!("Update workspace");

  let seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];
  let signer = &[&seeds[..]];

  workspace_manager::cpi::update_workspace(
    CpiContext::new_with_signer(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::UpdateWorkspace {
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
      },
      signer,
    ),
    workspace_manager::instructions::UpdateWorkspaceArguments { name },
  )?;

  Ok(())
}
