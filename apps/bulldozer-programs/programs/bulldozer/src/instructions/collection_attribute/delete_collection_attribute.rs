use crate::collections::{Budget, Collaborator, Collection, CollectionAttribute, User, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
  #[account(
    mut,
    close = budget
  )]
  pub attribute: Account<'info, CollectionAttribute>,
  #[account(
    mut,
    constraint = attribute.collection == collection.key() @ ErrorCode::CollectionDoesntMatchAttribute
  )]
  pub collection: Account<'info, Collection>,
  pub workspace: Box<Account<'info, Workspace>>,
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
}

pub fn handle(ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
  msg!("Delete collection attribute");
  ctx.accounts.collection.quantity_of_attributes -= 1;
  Ok(())
}
