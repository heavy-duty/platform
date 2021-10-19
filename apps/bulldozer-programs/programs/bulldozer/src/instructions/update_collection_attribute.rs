use crate::collections::{CollectionAttribute, CollectionAttributeDto};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: CollectionAttributeDto)]
pub struct UpdateCollectionAttribute<'info> {
  #[account(mut, has_one = authority)]
  pub attribute: Account<'info, CollectionAttribute>,
  pub authority: Signer<'info>,
}

pub fn handler(
  ctx: Context<UpdateCollectionAttribute>,
  dto: CollectionAttributeDto,
) -> ProgramResult {
  msg!("Update collection attribute");
  ctx.accounts.attribute.name = vectorize_string(dto.name, 32);
  ctx
    .accounts
    .attribute
    .set_modifier(dto.modifier, dto.size)?;
  ctx
    .accounts
    .attribute
    .set_kind(dto.kind, dto.max, dto.max_length)?;
  Ok(())
}
