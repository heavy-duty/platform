use crate::collections::{Budget, Workspace};
use crate::errors::ErrorCode;
use crate::utils::transfer_lamports;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WithdrawFromBudgetArguments {
  pub amount: u64,
}

#[derive(Accounts)]
#[instruction(arguments: WithdrawFromBudgetArguments)]
pub struct WithdrawFromBudget<'info> {
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
}

pub fn handle(
  ctx: Context<WithdrawFromBudget>,
  arguments: WithdrawFromBudgetArguments,
) -> Result<()> {
  msg!("Withdraw from budget");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    arguments.amount,
  )?;
  ctx.accounts.budget.withdraw(arguments.amount);
  Ok(())
}
