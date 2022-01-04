use crate::collections::{Application, Collection};
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
  #[account(
    mut,
    constraint = collection.application == application.key() @ ErrorCode::ApplicationDoesntMatchCollection
  )]
  pub application: Account<'info, Application>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<DeleteCollection>) -> ProgramResult {
  msg!("Delete collection");
  ctx.accounts.application.quantity_of_collections -= 1;
  Ok(())
}
