use crate::collections::{Application, Budget, Collaborator, Collection, User, Workspace};
use crate::errors::ErrorCode;
use crate::utils::get_budget_rent_exemption;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionArguments)]
pub struct CreateCollection<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + application + string (size 32 + 4 ?)
    // quantity of attributes + created at + updated at
    space = 8 + 32 + 32 + 32 + 36 + 1 + 8 + 8
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(mut)]
  pub application: Box<Account<'info, Application>>,
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

pub fn validate(ctx: &Context<CreateCollection>) -> std::result::Result<bool, ProgramError> {
  let collection_rent = **ctx.accounts.collection.to_account_info().lamports.borrow();
  let budget = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let budget_rent_exemption = get_budget_rent_exemption()?;

  if collection_rent + budget_rent_exemption > budget {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateCollection>,
  arguments: CreateCollectionArguments,
) -> ProgramResult {
  msg!("Create collection");

  // charge back to the authority
  let rent = **ctx.accounts.collection.to_account_info().lamports.borrow();
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

  ctx.accounts.collection.name = arguments.name;
  ctx.accounts.collection.authority = ctx.accounts.authority.key();
  ctx.accounts.collection.application = ctx.accounts.application.key();
  ctx.accounts.collection.workspace = ctx.accounts.workspace.key();
  ctx.accounts.collection.quantity_of_attributes = 0;
  ctx.accounts.application.quantity_of_collections += 1;
  ctx.accounts.collection.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collection.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
