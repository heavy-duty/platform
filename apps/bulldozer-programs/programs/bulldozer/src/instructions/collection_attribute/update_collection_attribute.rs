use crate::collections::{Collaborator, CollectionAttribute, User, Workspace};
use crate::enums::{get_attribute_kind, get_attribute_modifier};
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
  #[account(mut)]
  pub attribute: Account<'info, CollectionAttribute>,
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
}

pub fn validate(
  _ctx: &Context<UpdateCollectionAttribute>,
  arguments: &UpdateCollectionAttributeArguments,
) -> std::result::Result<bool, ProgramError> {
  match (arguments.kind, arguments.max, arguments.max_length) {
    (1, None, _) => Err(ErrorCode::MissingMax.into()),
    (2, _, None) => Err(ErrorCode::MissingMaxLength.into()),
    _ => Ok(true),
  }
}

pub fn handle(
  ctx: Context<UpdateCollectionAttribute>,
  arguments: UpdateCollectionAttributeArguments,
) -> ProgramResult {
  msg!("Update collection attribute");
  ctx.accounts.attribute.rename(arguments.name);
  ctx.accounts.attribute.change_settings(
    get_attribute_kind(arguments.kind, arguments.max, arguments.max_length)?,
    get_attribute_modifier(arguments.modifier, arguments.size)?,
  );
  ctx.accounts.attribute.bump_timestamp()?;
  Ok(())
}
