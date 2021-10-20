use crate::collections::{
  Attribute, AttributeDto, AttributeKindSetter, AttributeModifierSetter, CollectionAttribute,
};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AttributeDto)]
pub struct UpdateCollectionAttribute<'info> {
  #[account(mut, has_one = authority)]
  pub attribute: Account<'info, CollectionAttribute>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateCollectionAttribute>, dto: AttributeDto) -> ProgramResult {
  msg!("Update collection attribute");
  ctx.accounts.attribute.data = Attribute {
    name: vectorize_string(dto.name, 32),
    kind: None,
    modifier: None,
  };
  ctx
    .accounts
    .attribute
    .data
    .set_kind(Some(dto.kind), dto.max, dto.max_length)?;
  ctx
    .accounts
    .attribute
    .data
    .set_modifier(dto.modifier, dto.size)?;
  Ok(())
}
