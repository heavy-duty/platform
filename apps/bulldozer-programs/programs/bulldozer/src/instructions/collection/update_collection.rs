use crate::collections::Collection;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollectionArguments)]
pub struct UpdateCollection<'info> {
  #[account(mut, has_one = authority)]
  pub collection: Box<Account<'info, Collection>>,
  pub authority: Signer<'info>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handle(ctx: Context<UpdateCollection>, arguments: UpdateCollectionArguments) -> ProgramResult {
  msg!("Update collection");
  ctx.accounts.collection.name = arguments.name;
  ctx.accounts.collection.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
