use crate::collections::Collection;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollectionArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollectionArguments)]
pub struct UpdateCollection<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    has_one = authority @ ErrorCode::UnauthorizedCollectionUpdate
  )]
  pub collection: Account<'info, Collection>,
}

pub fn handle(ctx: Context<UpdateCollection>, arguments: UpdateCollectionArguments) -> Result<()> {
  msg!("Update collection");
  ctx.accounts.collection.name = arguments.name;
  ctx.accounts.collection.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
