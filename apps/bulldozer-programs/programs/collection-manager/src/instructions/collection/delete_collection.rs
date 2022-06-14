use crate::collections::Collection;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
  #[account(mut)]
  pub receiver: Signer<'info>,
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = receiver,
    has_one = authority @ ErrorCode::UnauthorizedCollectionDelete
  )]
  pub collection: Account<'info, Collection>,
}

pub fn handle(_ctx: Context<DeleteCollection>) -> Result<()> {
  msg!("Delete collection");
  Ok(())
}
