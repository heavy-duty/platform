use crate::collections::{Application, Budget, Collaborator, User, Workspace};
use crate::errors::ErrorCode;
use crate::utils::get_budget_rent_exemption;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateApplicationArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateApplicationArguments)]
pub struct CreateApplication<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + name (size 32 + 4 ?) +
    // quantity of collections + quantity of instructions +
    // created at + updated at
    space = 8 + 32 + 32 + 36 + 1 + 1 + 8 + 8,
  )]
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
  pub system_program: Program<'info, System>,
}

pub fn validate(ctx: &Context<CreateApplication>) -> std::result::Result<bool, ProgramError> {
  let application_rent = **ctx.accounts.application.to_account_info().lamports.borrow();
  let budget_in_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let budget_rent_exemption = get_budget_rent_exemption()?;

  if application_rent + budget_rent_exemption > budget_in_lamports {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateApplication>,
  arguments: CreateApplicationArguments,
) -> ProgramResult {
  msg!("Create application");

  // charge back to the authority
  let rent = **ctx.accounts.application.to_account_info().lamports.borrow();
  **ctx
    .accounts
    .budget
    .to_account_info()
    .try_borrow_mut_lamports()? -= rent;
  **ctx
    .accounts
    .authority
    .to_account_info()
    .try_borrow_mut_lamports()? += rent;

  ctx.accounts.application.name = arguments.name;
  ctx.accounts.application.authority = ctx.accounts.authority.key();
  ctx.accounts.application.workspace = ctx.accounts.workspace.key();
  ctx.accounts.application.quantity_of_collections = 0;
  ctx.accounts.application.quantity_of_instructions = 0;
  ctx.accounts.workspace.quantity_of_applications += 1;
  ctx.accounts.application.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.application.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
