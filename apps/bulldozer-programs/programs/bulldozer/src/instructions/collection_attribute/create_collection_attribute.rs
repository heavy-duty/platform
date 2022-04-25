use crate::collections::{
  Application, Budget, Collaborator, Collection, CollectionAttribute, CollectionStats, User,
  Workspace,
};
use crate::enums::{AttributeKinds, AttributeModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use crate::utils::transfer_lamports;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionAttributeArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionAttributeArguments)]
pub struct CreateCollectionAttribute<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace)]
  pub application: Box<Account<'info, Application>>,
  #[account(
    constraint = collection.application == application.key() @ ErrorCode::CollectionDoesNotBelongToApplication,
    constraint = collection.workspace == workspace.key() @ ErrorCode::CollectionDoesNotBelongToWorkspace
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
    init,
    payer = authority,
    space = CollectionAttribute::space(),
  )]
  pub attribute: Box<Account<'info, CollectionAttribute>>,
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
    mut,
    seeds = [
      b"collection_stats".as_ref(),
      collection.key().as_ref()
    ],
    bump = collection.collection_stats_bump
  )]
  pub collection_stats: Box<Account<'info, CollectionStats>>,
}

pub fn validate(
  ctx: &Context<CreateCollectionAttribute>,
  arguments: &CreateCollectionAttributeArguments,
) -> Result<bool> {
  match (arguments.kind, arguments.max, arguments.max_length) {
    (1, None, _) => Err(error!(ErrorCode::MissingMax)),
    (2, _, None) => Err(error!(ErrorCode::MissingMaxLength)),
    _ => {
      let budget_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
      let collection_attribute_rent = **ctx.accounts.attribute.to_account_info().lamports.borrow();

      let funds_required = &Budget::get_rent_exemption()?
        .checked_add(collection_attribute_rent)
        .unwrap();

      if budget_lamports.lt(funds_required) {
        return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
      }

      Ok(true)
    }
  }
}

pub fn handle(
  ctx: Context<CreateCollectionAttribute>,
  arguments: CreateCollectionAttributeArguments,
) -> Result<()> {
  msg!("Create collection attribute");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.attribute.to_account_info().lamports.borrow(),
  )?;
  ctx.accounts.attribute.initialize(
    arguments.name,
    ctx.accounts.authority.key(),
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    ctx.accounts.collection.key(),
    AttributeKinds::create(arguments.kind, arguments.max, arguments.max_length)?,
    AttributeModifiers::create(arguments.modifier, arguments.size)?,
  );
  ctx.accounts.collection_stats.increase_attribute_quantity();
  ctx.accounts.attribute.initialize_timestamp()?;
  Ok(())
}
