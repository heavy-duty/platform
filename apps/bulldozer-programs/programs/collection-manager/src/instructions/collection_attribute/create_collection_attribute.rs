use crate::collections::CollectionAttribute;
use crate::enums::{AttributeKinds, AttributeModifiers};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionAttributeArguments {
  pub id: u32,
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionAttributeArguments)]
pub struct CreateCollectionAttribute<'info> {
  pub system_program: Program<'info, System>,
  /// CHECK: An collection owner can be anything
  pub owner: UncheckedAccount<'info>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    init,
    payer = authority,
    space = CollectionAttribute::space(),
    seeds = [
      b"collection_attribute".as_ref(),
      owner.key().as_ref(),
      &arguments.id.to_le_bytes(),
    ],
    bump,
  )]
  pub collection_attribute: Account<'info, CollectionAttribute>,
}

pub fn handle(
  ctx: Context<CreateCollectionAttribute>,
  arguments: CreateCollectionAttributeArguments,
) -> Result<()> {
  msg!("Create collection attribute");
  ctx.accounts.collection_attribute.id = arguments.id;
  ctx.accounts.collection_attribute.name = arguments.name;
  ctx.accounts.collection_attribute.authority = ctx.accounts.authority.key();
  ctx.accounts.collection_attribute.owner = ctx.accounts.owner.key();
  ctx.accounts.collection_attribute.kind =
    AttributeKinds::create(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.collection_attribute.modifier =
    AttributeModifiers::create(arguments.modifier, arguments.size)?;
  ctx.accounts.collection_attribute.bump = *ctx.bumps.get("collection_attribute").unwrap();
  ctx.accounts.collection_attribute.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collection_attribute.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
