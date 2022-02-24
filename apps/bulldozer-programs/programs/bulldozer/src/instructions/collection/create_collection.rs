use crate::collections::{Application, Budget, Collaborator, Collection, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::{fund_rent_for_account, has_enough_funds};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionArguments)]
pub struct CreateCollection<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    mut,
    constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace
  )]
  pub application: Box<Account<'info, Application>>,
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
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
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
  #[account(
    init,
    payer = authority,
    space = Collection::space()
  )]
  pub collection: Box<Account<'info, Collection>>,
  pub system_program: Program<'info, System>,
}

pub fn validate(ctx: &Context<CreateCollection>) -> std::result::Result<bool, ProgramError> {
  if !has_enough_funds(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.collection.to_account_info(),
    Budget::get_rent_exemption()?,
  ) {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateCollection>,
  arguments: CreateCollectionArguments,
) -> ProgramResult {
  msg!("Create collection");
  fund_rent_for_account(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.collection.to_account_info().lamports.borrow(),
  )?;
  ctx.accounts.collection.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
  );
  ctx.accounts.collection.initialize_timestamp()?;
  ctx.accounts.application.increase_collection_quantity();
  Ok(())
}
