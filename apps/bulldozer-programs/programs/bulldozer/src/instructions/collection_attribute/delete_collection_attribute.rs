use crate::collections::{CollectionAttribute, Collection};
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority
  )]
  pub attribute: Account<'info, CollectionAttribute>,
  #[account(
    mut,
    constraint = attribute.collection == collection.key() @ ErrorCode::CollectionDoesntMatchAttribute
  )]
  pub collection: Account<'info, Collection>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
  msg!("Delete collection attribute");
  ctx.accounts.collection.quantity_of_attributes -= 1;
  Ok(())
}
