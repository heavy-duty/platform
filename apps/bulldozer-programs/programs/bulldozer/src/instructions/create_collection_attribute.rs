use crate::collections::{
  Application, Attribute, AttributeDto, AttributeKind, AttributeModifier, Collection,
  CollectionAttribute,
};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AttributeDto)]
pub struct CreateCollectionAttribute<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 3 + 3
    )]
  pub attribute: Box<Account<'info, CollectionAttribute>>,
  pub application: Box<Account<'info, Application>>,
  pub collection: Box<Account<'info, Collection>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateCollectionAttribute>, dto: AttributeDto) -> ProgramResult {
  msg!("Create collection attribute");
  ctx.accounts.attribute.authority = ctx.accounts.authority.key();
  ctx.accounts.attribute.application = ctx.accounts.application.key();
  ctx.accounts.attribute.collection = ctx.accounts.collection.key();
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
