use crate::collections::{Budget, Workspace};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteBudget<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    mut,  
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump,
    has_one = workspace, 
    close = authority
  )]
  pub budget: Box<Account<'info, Budget>>,
  #[account(
    mut, 
    seeds = [
      b"budget_wallet".as_ref(),
      budget.key().as_ref(),
    ],
    bump,
  )]
  pub budget_wallet: SystemAccount<'info>,
}

pub fn handle(ctx: Context<DeleteBudget>) -> Result<()> {
  msg!("Delete budget");
  
  let seeds = &[
    b"budget_wallet".as_ref(),
    ctx.accounts.budget.to_account_info().key.as_ref(),
    &[ctx.accounts.budget.wallet_bump],
  ];
  let signer = &[&seeds[..]];

  anchor_lang::solana_program::program::invoke_signed(
    &anchor_lang::solana_program::system_instruction::transfer(
      &ctx.accounts.budget_wallet.key(),
      &ctx.accounts.authority.key(),
      ctx.accounts.budget_wallet.lamports(),
    ),
    &[
      ctx.accounts.budget_wallet.to_account_info().clone(),
      ctx.accounts.authority.to_account_info().clone(),
      ctx.accounts.system_program.to_account_info().clone(),
    ],
    signer
  )?;
  
  Ok(())
}
