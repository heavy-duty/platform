use crate::collections::{Budget, Collaborator, Collection, CollectionAttribute, User};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = budget,
    constraint = attribute.collection == collection.key() @ ErrorCode::CollectionAttributeDoesNotBelongToCollection,
  )]
  pub attribute: Account<'info, CollectionAttribute>,
  #[account(
    mut,
    constraint = collection.workspace == attribute.workspace @ ErrorCode::CollectionDoesNotBelongToWorkspace
  )]
  pub collection: Account<'info, Collection>,
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
      attribute.workspace.as_ref(),
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
      attribute.workspace.as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteCollectionAttribute>) -> Result<()> {
  msg!("Delete collection attribute");
  ctx.accounts.collection.decrease_attribute_quantity();
  Ok(())
}
