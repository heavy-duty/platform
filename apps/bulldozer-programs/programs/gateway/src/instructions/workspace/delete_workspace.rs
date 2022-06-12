use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Budget, Collaborator, Workspace, WorkspaceStats};
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
pub struct DeleteWorkspace<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub system_program: Program<'info, System>,
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
  pub user: Box<Account<'info, User>>,
  #[account(mut)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    mut,
    seeds = [
      b"workspace_stats".as_ref(),
      workspace.key().as_ref()
    ],
    bump = workspace.workspace_stats_bump,
    seeds::program = workspace_manager_program.key()
  )]
  pub workspace_stats: Box<Account<'info, WorkspaceStats>>,
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
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
    seeds::program = workspace_manager_program.key(),
  )]
  pub budget: Box<Account<'info, Budget>>,
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

  workspace_manager::cpi::delete_budget(CpiContext::new(
    ctx.accounts.workspace_manager_program.to_account_info(),
    workspace_manager::cpi::accounts::DeleteBudget {
      system_program: ctx.accounts.system_program.to_account_info(),
      budget: ctx.accounts.budget.to_account_info(),
      budget_wallet: ctx.accounts.budget_wallet.to_account_info(),
      workspace: ctx.accounts.workspace.to_account_info(),
      authority: ctx.accounts.authority.to_account_info(),
    },
  ))?;

  workspace_manager::cpi::delete_workspace(CpiContext::new(
    ctx.accounts.workspace_manager_program.to_account_info(),
    workspace_manager::cpi::accounts::DeleteWorkspace {
      collaborator: ctx.accounts.collaborator.to_account_info(),
      user_manager_program: ctx.accounts.user_manager_program.to_account_info(),
      user: ctx.accounts.user.to_account_info(),
      workspace: ctx.accounts.workspace.to_account_info(),
      workspace_stats: ctx.accounts.workspace_stats.to_account_info(),
      authority: ctx.accounts.authority.to_account_info(),
    },
  ))?;

  Ok(())
}
