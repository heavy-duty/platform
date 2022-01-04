use crate::collections::Collection;
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority,
    constraint = collection.quantity_of_attributes == 0 @ ErrorCode::CantDeleteCollectionWithAttributes
  )]
  pub collection: Account<'info, Collection>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteCollection>) -> ProgramResult {
  msg!("Delete collection");
  Ok(())
}
