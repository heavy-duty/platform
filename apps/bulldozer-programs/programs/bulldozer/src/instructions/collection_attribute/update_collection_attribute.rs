use crate::collections::{Collaborator, Collection, CollectionAttribute, User, Workspace};
use crate::enums::{AttributeKinds, AttributeModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollectionAttributeArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollectionAttributeArguments)]
pub struct UpdateCollectionAttribute<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = collection.workspace == workspace.key() @ ErrorCode::CollectionDoesNotBelongToWorkspace
  )]
  pub collection: Account<'info, Collection>,
  #[account(
    mut,
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
}

pub fn validate(
  _ctx: &Context<UpdateCollectionAttribute>,
  arguments: &UpdateCollectionAttributeArguments,
) -> Result<bool> {
  match (arguments.kind, arguments.max, arguments.max_length) {
    (1, None, _) => Err(error!(ErrorCode::MissingMax)),
    (2, _, None) => Err(error!(ErrorCode::MissingMaxLength)),
    _ => Ok(true),
  }
}

pub fn handle(
  ctx: Context<UpdateCollectionAttribute>,
  arguments: UpdateCollectionAttributeArguments,
) -> Result<()> {
  msg!("Update collection attribute");
  ctx.accounts.attribute.rename(arguments.name);
  ctx.accounts.attribute.change_settings(
    AttributeKinds::create(arguments.kind, arguments.max, arguments.max_length)?,
    AttributeModifiers::create(arguments.modifier, arguments.size)?,
  );
  ctx.accounts.attribute.bump_timestamp()?;
  Ok(())
}
