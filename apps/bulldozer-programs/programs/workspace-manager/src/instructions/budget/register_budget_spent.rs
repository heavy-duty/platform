use crate::collections::{Budget, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RegisterBudgetSpentArguments {
  pub amount: u64,
}

#[derive(Accounts)]
#[instruction(arguments: RegisterBudgetSpentArguments)]
pub struct RegisterBudgetSpent<'info> {
  pub system_program: Program<'info, System>,
  pub authority: Signer<'info>,
  #[account(
    has_one = authority @ ErrorCode::UnauthorizedRegisterBudgetSpent
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
}

pub fn handle(
  ctx: Context<RegisterBudgetSpent>,
  arguments: RegisterBudgetSpentArguments,
) -> Result<()> {
  msg!("Register budget spent");
  ctx.accounts.budget.total_available = ctx
    .accounts
    .budget
    .total_available
    .checked_sub(arguments.amount)
    .unwrap();
  ctx.accounts.budget.total_value_locked = ctx
    .accounts
    .budget
    .total_value_locked
    .checked_add(arguments.amount)
    .unwrap();
  Ok(())
}
