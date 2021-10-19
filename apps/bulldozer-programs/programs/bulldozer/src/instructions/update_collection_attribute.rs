use crate::collections::CollectionAttribute;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>
)]
pub struct UpdateCollectionAttribute<'info> {
  #[account(mut, has_one = authority)]
  pub attribute: Account<'info, CollectionAttribute>,
  pub authority: Signer<'info>,
}

pub fn handler(
  ctx: Context<UpdateCollectionAttribute>,
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>,
) -> ProgramResult {
  msg!("Update collection attribute");
  ctx.accounts.attribute.name = vectorize_string(name, 32);
  ctx.accounts.attribute.set_modifier(modifier, size)?;
  ctx.accounts.attribute.set_kind(kind, max, max_length)?;
  Ok(())
}
