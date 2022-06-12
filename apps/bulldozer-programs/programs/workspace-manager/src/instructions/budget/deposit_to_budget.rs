use crate::collections::{Budget, Workspace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct DepositToBudgetArguments {
  pub amount: u64,
}

#[derive(Accounts)]
#[instruction(arguments: DepositToBudgetArguments)]
pub struct DepositToBudget<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
  #[account(
    mut,
    seeds = [
      b"budget_wallet".as_ref(),
      budget.key().as_ref(),
    ],
    bump = budget.wallet_bump,
  )]
  pub budget_wallet: SystemAccount<'info>,
}

pub fn handle(ctx: Context<DepositToBudget>, arguments: DepositToBudgetArguments) -> Result<()> {
  msg!("Deposit to budget");
  anchor_lang::solana_program::program::invoke(
    &anchor_lang::solana_program::system_instruction::transfer(
      &ctx.accounts.authority.key(),
      &ctx.accounts.budget_wallet.key(),
      arguments.amount,
    ),
    &[
      ctx.accounts.authority.to_account_info().clone(),
      ctx.accounts.budget_wallet.to_account_info().clone(),
      ctx.accounts.system_program.to_account_info().clone(),
    ],
  )?;
  ctx.accounts.budget.deposit(arguments.amount);
  Ok(())
}
