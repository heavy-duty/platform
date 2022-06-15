use crate::collections::CollectionAttribute;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
  #[account(mut)]
  pub receiver: Signer<'info>,
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = receiver,
    has_one = authority @ ErrorCode::UnauthorizedCollectionAttributeDelete
  )]
  pub collection_attribute: Account<'info, CollectionAttribute>,
}

pub fn handle(_ctx: Context<DeleteCollectionAttribute>) -> Result<()> {
  msg!("Delete collection attribute");
  Ok(())
}
