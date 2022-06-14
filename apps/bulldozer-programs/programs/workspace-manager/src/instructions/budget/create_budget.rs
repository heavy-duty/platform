use crate::collections::{Budget, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(Accounts)]
pub struct CreateBudget<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub system_program: Program<'info, System>,
  pub authority: Signer<'info>,
  #[account(
    has_one = authority @ ErrorCode::UnauthorizedCreateBudget 
  )]
  pub workspace: Account<'info, Workspace>,
  #[account(mut)]
  pub payer: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      payer.key().as_ref(),
    ],
    bump = user.bump,
    seeds::program = user_manager_program.key()
  )]
  pub user: Account<'info, User>,
  #[account(
    init,
    payer = payer,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump,
    space = Budget::space(),
  )]
  pub budget: Account<'info, Budget>,
  #[account(
    init,
    payer = payer,
    seeds = [
      b"budget_wallet".as_ref(),
      budget.key().as_ref(),
    ],
    bump,
    space = 0,
    owner = system_program.key(),
  )]
  /// CHECK: the wallet is a system account but it fails when using SystemAccount
  pub budget_wallet: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<CreateBudget>) -> Result<()> {
  msg!("Create budget");
  ctx.accounts.budget.workspace = ctx.accounts.workspace.key();
  ctx.accounts.budget.total_deposited = 0;
  ctx.accounts.budget.total_available = 0;
  ctx.accounts.budget.total_value_locked = 0;
  ctx.accounts.budget.bump = *ctx.bumps.get("budget").unwrap();
  ctx.accounts.budget.wallet_bump = *ctx.bumps.get("budget_wallet").unwrap();
  ctx.accounts.budget.created_at = Clock::get()?.unix_timestamp;
  Ok(())
}
