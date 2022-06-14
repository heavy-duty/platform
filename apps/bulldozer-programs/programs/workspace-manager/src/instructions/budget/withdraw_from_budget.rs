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
  pub authority: Signer<'info>,
  #[account(mut)]
  pub receiver: Signer<'info>,
  #[account(
    has_one = authority @ ErrorCode::UnauthorizedWithdrawFromBudget
  )]
  pub workspace: Account<'info, Workspace>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Account<'info, Budget>,
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

pub fn validate(
  ctx: &Context<WithdrawFromBudget>,
  arguments: &WithdrawFromBudgetArguments,
) -> Result<bool> {
  let budget_lamports = **ctx
    .accounts
    .budget_wallet
    .to_account_info()
    .lamports
    .borrow();

  let funds_required = Rent::get()?
    .minimum_balance(0)
    .checked_add(arguments.amount)
    .unwrap();

  msg!(
    "wtf?? budget lamports: {0} | budget rent exemption: {1} | amount: {2} | funds required: {3}",
    budget_lamports,
    Rent::get()?.minimum_balance(0),
    arguments.amount,
    funds_required
  );

  if budget_lamports.lt(&funds_required) {
    return Err(error!(ErrorCode::BudgetHasInsufficientFunds));
  }

  Ok(true)
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
      &ctx.accounts.receiver.key(),
      arguments.amount,
    ),
    &[
      ctx.accounts.budget_wallet.to_account_info().clone(),
      ctx.accounts.receiver.to_account_info().clone(),
      ctx.accounts.system_program.to_account_info().clone(),
    ],
    signer,
  )?;
  ctx.accounts.budget.total_available = ctx
    .accounts
    .budget
    .total_available
    .checked_sub(arguments.amount)
    .unwrap();

  Ok(())
}
