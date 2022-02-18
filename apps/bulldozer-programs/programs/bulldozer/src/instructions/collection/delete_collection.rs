use crate::collections::{Application, Budget, Collaborator, Collection, User, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
  #[account(
    mut,
    close = budget,
    constraint = collection.quantity_of_attributes == 0 @ ErrorCode::CantDeleteCollectionWithAttributes
  )]
  pub collection: Account<'info, Collection>,
  #[account(
    mut,
    constraint = collection.application == application.key() @ ErrorCode::ApplicationDoesntMatchCollection
  )]
  pub application: Account<'info, Application>,
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

pub fn handle(ctx: Context<DeleteCollection>) -> ProgramResult {
  msg!("Delete collection");
  ctx.accounts.application.quantity_of_collections -= 1;
  Ok(())
}
