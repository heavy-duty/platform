use crate::collections::{Application, Budget, Collaborator, Collection, User};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = budget,
    constraint = collection.quantity_of_attributes == 0 @ ErrorCode::CantDeleteCollectionWithAttributes,
    constraint = collection.application == application.key() @ ErrorCode::CollectionDoesNotBelongToApplication,
  )]
  pub collection: Account<'info, Collection>,
  #[account(
    mut,
    constraint = application.workspace == collection.workspace @ ErrorCode::ApplicationDoesNotBelongToWorkspace
  )]
  pub application: Account<'info, Application>,
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
      collection.workspace.as_ref(),
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
      collection.workspace.as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteCollection>) -> Result<()> {
  msg!("Delete collection");
  ctx.accounts.application.decrease_collection_quantity();
  Ok(())
}
