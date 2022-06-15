use crate::collections::CollectionAttribute;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetCollectionAttributeAuthority<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut, 
    has_one = authority @ ErrorCode::UnauthorizedCollectionAttributeSetAuthority
  )]
  pub collection_attribute: Account<'info, CollectionAttribute>,
  /// CHECK: New authority can be any type of account.
  pub new_authority: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<SetCollectionAttributeAuthority>) -> Result<()> {
  msg!("Set collection attribute authority");
  ctx.accounts.collection_attribute.authority = ctx.accounts.new_authority.key();
  ctx.accounts.collection_attribute.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
