use crate::collections::CollectionAttribute;
use crate::enums::{AttributeKind, AttributeKindModifier};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, size: u8)]
pub struct UpdateCollectionAttribute<'info> {
  #[account(mut, has_one = authority)]
  pub attribute: Account<'info, CollectionAttribute>,
  pub authority: Signer<'info>,
}

pub fn handler(
  ctx: Context<UpdateCollectionAttribute>,
  name: String,
  kind: u8,
  modifier: u8,
  size: u8,
) -> ProgramResult {
  msg!("Update collection attribute");
  ctx.accounts.attribute.name = vectorize_string(name, 32);
  ctx.accounts.attribute.kind = AttributeKind::from_index(kind)?;
  ctx.accounts.attribute.modifier = AttributeKindModifier::from_index(modifier, size)?;
  Ok(())
}
