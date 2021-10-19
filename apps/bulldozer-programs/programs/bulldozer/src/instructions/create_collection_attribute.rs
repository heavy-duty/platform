use crate::collections::{Application, Collection, CollectionAttribute};
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

pub fn handler(
  ctx: Context<CreateCollectionAttribute>,
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>,
) -> ProgramResult {
  msg!("Create collection attribute");
  ctx.accounts.attribute.name = vectorize_string(name, 32);
  ctx.accounts.attribute.authority = ctx.accounts.authority.key();
  ctx.accounts.attribute.collection = ctx.accounts.collection.key();
  ctx.accounts.attribute.application = ctx.accounts.application.key();
  ctx.accounts.attribute.set_kind(kind, max, max_length)?;
  ctx.accounts.attribute.set_modifier(modifier, size)?;
  Ok(())
}
