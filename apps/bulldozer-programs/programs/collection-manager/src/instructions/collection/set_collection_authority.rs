use crate::collections::Collection;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetCollectionAuthority<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut, 
    has_one = authority @ ErrorCode::UnauthorizedCollectionSetAuthority
  )]
  pub collection: Account<'info, Collection>,
  /// CHECK: New authority can be any type of account.
  pub new_authority: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<SetCollectionAuthority>) -> Result<()> {
  msg!("Set collection authority");
  ctx.accounts.collection.authority = ctx.accounts.new_authority.key();
  ctx.accounts.collection.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
