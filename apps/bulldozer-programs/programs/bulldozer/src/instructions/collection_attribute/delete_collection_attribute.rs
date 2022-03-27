use crate::collections::{
  Budget, Collaborator, Collection, CollectionAttribute, CollectionStats, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = collection.workspace == workspace.key() @ ErrorCode::CollectionDoesNotBelongToWorkspace
  )]
  pub collection: Account<'info, Collection>,
  #[account(
    mut,
    close = budget,
    constraint = attribute.collection == collection.key() @ ErrorCode::CollectionAttributeDoesNotBelongToCollection,
    constraint = attribute.workspace == workspace.key() @ ErrorCode::CollectionAttributeDoesNotBelongToWorkspace,
  )]
  pub attribute: Account<'info, CollectionAttribute>,
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

pub fn handle(ctx: Context<DeleteCollectionAttribute>) -> Result<()> {
  msg!("Delete collection attribute");
  ctx.accounts.collection_stats.decrease_attribute_quantity();
  Ok(())
}
