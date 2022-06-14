use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Budget, Collaborator, Workspace};
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
pub struct DeleteWorkspace<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub system_program: Program<'info, System>,
  pub gateway: Account<'info, Gateway>,
  #[account(mut)]
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
    mut,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    seeds::program = workspace_manager_program.key(),
  )]
  pub collaborator: Account<'info, Collaborator>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
    seeds::program = workspace_manager_program.key(),
    constraint = collaborator.is_admin @ ErrorCode::OnlyAdminCollaboratorCanDelete,
  )]
  pub budget: Account<'info, Budget>,
  #[account(
    mut,
    seeds = [
      b"budget_wallet".as_ref(),
      budget.key().as_ref(),
    ],
    bump = budget.wallet_bump,
    seeds::program = workspace_manager_program.key(),
  )]
  pub budget_wallet: SystemAccount<'info>,
}

pub fn handle(ctx: Context<DeleteWorkspace>) -> Result<()> {
  msg!("Delete workspace");

  let seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];
  let signer = &[&seeds[..]];

  workspace_manager::cpi::delete_budget(CpiContext::new_with_signer(
    ctx.accounts.workspace_manager_program.to_account_info(),
    workspace_manager::cpi::accounts::DeleteBudget {
      system_program: ctx.accounts.system_program.to_account_info(),
      budget: ctx.accounts.budget.to_account_info(),
      budget_wallet: ctx.accounts.budget_wallet.to_account_info(),
      workspace: ctx.accounts.workspace.to_account_info(),
      authority: ctx.accounts.gateway.to_account_info(),
      receiver: ctx.accounts.authority.to_account_info(),
    },
    signer,
  ))?;

  workspace_manager::cpi::delete_collaborator(CpiContext::new_with_signer(
    ctx.accounts.workspace_manager_program.to_account_info(),
    workspace_manager::cpi::accounts::DeleteCollaborator {
      user_manager_program: ctx.accounts.user_manager_program.to_account_info(),
      collaborator: ctx.accounts.collaborator.to_account_info(),
      workspace: ctx.accounts.workspace.to_account_info(),
      authority: ctx.accounts.gateway.to_account_info(),
      receiver: ctx.accounts.authority.to_account_info(),
    },
    signer,
  ))?;

  workspace_manager::cpi::delete_workspace(CpiContext::new_with_signer(
    ctx.accounts.workspace_manager_program.to_account_info(),
    workspace_manager::cpi::accounts::DeleteWorkspace {
      workspace: ctx.accounts.workspace.to_account_info(),
      authority: ctx.accounts.gateway.to_account_info(),
      receiver: ctx.accounts.authority.to_account_info(),
    },
    signer,
  ))?;

  Ok(())
}
