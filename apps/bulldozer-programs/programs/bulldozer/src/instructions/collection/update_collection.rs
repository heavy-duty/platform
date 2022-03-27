use crate::collections::{Application, Collaborator, Collection, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollectionArguments)]
pub struct UpdateCollection<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace
  )]
  pub application: Box<Account<'info, Application>>,
  #[account(
    mut,
    constraint = collection.workspace == workspace.key() @ ErrorCode::CollectionDoesNotBelongToWorkspace,
    constraint = collection.application == application.key() @ ErrorCode::CollectionDoesNotBelongToApplication,
  )]
  pub collection: Box<Account<'info, Collection>>,
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
}

pub fn handle(ctx: Context<UpdateCollection>, arguments: UpdateCollectionArguments) -> Result<()> {
  msg!("Update collection");
  ctx.accounts.collection.rename(arguments.name);
  ctx.accounts.collection.bump_timestamp()?;
  Ok(())
}
