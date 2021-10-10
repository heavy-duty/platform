use crate::collections::Collection;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateCollection<'info> {
  #[account(mut, has_one = authority)]
  pub collection: Box<Account<'info, Collection>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateCollection>, name: String) -> ProgramResult {
  msg!("Update collection");
  ctx.accounts.collection.name = vectorize_string(name, 32);
  Ok(())
}
