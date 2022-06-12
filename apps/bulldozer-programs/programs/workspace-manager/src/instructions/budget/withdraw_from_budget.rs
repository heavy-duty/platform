use crate::collections::{Budget, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WithdrawFromBudgetArguments {
  pub amount: u64,
}

#[derive(Accounts)]
#[instruction(arguments: WithdrawFromBudgetArguments)]
pub struct WithdrawFromBudget<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(has_one = authority @ ErrorCode::UnauthorizedWithdraw)]
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

pub fn handle(
  ctx: Context<WithdrawFromBudget>,
  arguments: WithdrawFromBudgetArguments,
) -> Result<()> {
  msg!("Withdraw from budget");

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
      arguments.amount,
    ),
    &[
      ctx.accounts.budget_wallet.to_account_info().clone(),
      ctx.accounts.authority.to_account_info().clone(),
      ctx.accounts.system_program.to_account_info().clone(),
    ],
    signer,
  )?;

  ctx.accounts.budget.withdraw(arguments.amount);
  Ok(())
}
