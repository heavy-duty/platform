use crate::collections::{Budget, Workspace};
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(Accounts)]
pub struct CreateBudget<'info> {
  pub user_manager_program: Program<'info, UserManager>,
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
  #[account(
    constraint = workspace.authority == authority.key()
  )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    init,
    payer = authority,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump,
    space = Budget::space(),
  )]
  pub budget: Box<Account<'info, Budget>>,
  #[account(
    init,
    payer = authority,
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
  ctx.accounts.budget.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    *ctx.bumps.get("budget").unwrap(),
    *ctx.bumps.get("budget_wallet").unwrap(),
  );
  ctx.accounts.budget.initialize_timestamp()?;
  Ok(())
}
