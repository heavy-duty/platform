use crate::collections::CollectionAttribute;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
  #[account(mut, has_one = authority, close = authority)]
  pub attribute: Account<'info, CollectionAttribute>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
  msg!("Delete collection attribute");
  Ok(())
}
