use crate::collections::{Budget, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteBudget<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub receiver: Signer<'info>,
  pub authority: Signer<'info>,
  #[account(has_one = authority @ ErrorCode::UnauthorizedDeleteBudget)]
  pub workspace: Account<'info, Workspace>,
  #[account(
    mut,  
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump,
    has_one = workspace, 
    close = receiver
  )]
  pub budget: Account<'info, Budget>,
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
      &ctx.accounts.receiver.key(),
      ctx.accounts.budget_wallet.lamports(),
    ),
    &[
      ctx.accounts.budget_wallet.to_account_info().clone(),
      ctx.accounts.receiver.to_account_info().clone(),
      ctx.accounts.system_program.to_account_info().clone(),
    ],
    signer
  )?;
  
  Ok(())
}
