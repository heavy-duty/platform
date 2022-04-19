use crate::collections::{
  Application, ApplicationStats, Budget, Collaborator, Collection, CollectionStats, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::transfer_lamports;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionArguments)]
pub struct CreateCollection<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace)]
  pub application: Box<Account<'info, Application>>,
  #[account(
    init,
    payer = authority,
    space = Collection::space()
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
    mut,
    seeds = [
      b"application_stats".as_ref(),
      application.key().as_ref()
    ],
    bump = application.application_stats_bump
  )]
  pub application_stats: Box<Account<'info, ApplicationStats>>,
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
    space = CollectionStats::space(),
    seeds = [
      b"collection_stats".as_ref(),
      collection.key().as_ref()
    ],
    bump
  )]
  pub collection_stats: Box<Account<'info, CollectionStats>>,
}

pub fn validate(ctx: &Context<CreateCollection>) -> Result<bool> {
  let budget_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let collection_rent = **ctx.accounts.collection.to_account_info().lamports.borrow();
  let collection_stats_rent = **ctx
    .accounts
    .collection_stats
    .to_account_info()
    .lamports
    .borrow();
  let funds_required = &Budget::get_rent_exemption()?
    .checked_add(collection_rent)
    .unwrap()
    .checked_add(collection_stats_rent)
    .unwrap();

  if budget_lamports.lt(funds_required) {
    return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
  }

  Ok(true)
}

pub fn handle(ctx: Context<CreateCollection>, arguments: CreateCollectionArguments) -> Result<()> {
  msg!("Create collection");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.collection.to_account_info().lamports.borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .collection_stats
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  ctx.accounts.collection.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    *ctx.bumps.get("collection_stats").unwrap(),
  );
  ctx.accounts.collection.initialize_timestamp()?;
  ctx.accounts.collection_stats.initialize();
  ctx
    .accounts
    .application_stats
    .increase_collection_quantity();
  Ok(())
}
