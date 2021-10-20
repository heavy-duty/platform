use crate::collections::{Attribute, AttributeDto, CollectionAttribute};
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
  ctx.accounts.attribute.data = Attribute::create(dto)?;
  Ok(())
}
