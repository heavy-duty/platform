use crate::collections::{
  Application, ApplicationStats, Budget, Collaborator, Collection, CollectionStats, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace)]
  pub application: Account<'info, Application>,
  #[account(
    mut,
    close = budget,
    constraint = collection.application == application.key() @ ErrorCode::CollectionDoesNotBelongToApplication,
    constraint = collection.workspace == workspace.key() @ ErrorCode::CollectionDoesNotBelongToWorkspace,
  )]
  pub collection: Account<'info, Collection>,
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
    mut,
    close = budget,
    constraint = collection_stats.quantity_of_attributes == 0 @ ErrorCode::CantDeleteCollectionWithAttributes,
    seeds = [
      b"collection_stats".as_ref(),
      collection.key().as_ref()
    ],
    bump = collection.collection_stats_bump
  )]
  pub collection_stats: Box<Account<'info, CollectionStats>>,
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
}

pub fn handle(ctx: Context<DeleteCollection>) -> Result<()> {
  msg!("Delete collection");
  ctx
    .accounts
    .application_stats
    .decrease_collection_quantity();
  Ok(())
}
