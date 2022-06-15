use crate::collections::CollectionAttribute;
use crate::enums::{AttributeKinds, AttributeModifiers};
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
  #[account(
    mut,
    has_one = authority @ ErrorCode::UnauthorizedCollectionAttributeUpdate
  )]
  pub collection_attribute: Account<'info, CollectionAttribute>,
}

pub fn handle(
  ctx: Context<UpdateCollectionAttribute>,
  arguments: UpdateCollectionAttributeArguments,
) -> Result<()> {
  msg!("Update collection attribute");
  ctx.accounts.collection_attribute.name = arguments.name;
  ctx.accounts.collection_attribute.updated_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collection_attribute.kind =
    AttributeKinds::create(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.collection_attribute.modifier =
    AttributeModifiers::create(arguments.modifier, arguments.size)?;
  Ok(())
}
