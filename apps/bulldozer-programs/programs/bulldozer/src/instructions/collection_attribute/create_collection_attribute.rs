use crate::collections::{
  Application, Collection, CollectionAttribute, Workspace,
};
use crate::enums::{
  get_attribute_kind,
  get_attribute_modifier
};
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionAttributeArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionAttributeArguments)]
pub struct CreateCollectionAttribute<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + application
    // collection + name (size 32 + 4 ?) + kind + modifier
    // created at + updated at
    space = 8 + 32 + 32 + 32 + 32 + 36 + 6 + 6 + 8 + 8,
    constraint = arguments.kind == 0 || arguments.kind == 1 && arguments.max != None || arguments.kind == 2 @ ErrorCode::MissingMax,
    constraint = arguments.kind == 0 || arguments.kind == 1 || arguments.kind == 2 && arguments.max_length != None @ ErrorCode::MissingMaxLength,
  )]
  pub attribute: Box<Account<'info, CollectionAttribute>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub collection: Box<Account<'info, Collection>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<CreateCollectionAttribute>, arguments: CreateCollectionAttributeArguments) -> ProgramResult {
  msg!("Create collection attribute");
  ctx.accounts.attribute.authority = ctx.accounts.authority.key();
  ctx.accounts.attribute.workspace = ctx.accounts.workspace.key();
  ctx.accounts.attribute.application = ctx.accounts.application.key();
  ctx.accounts.attribute.collection = ctx.accounts.collection.key();
  ctx.accounts.attribute.name = arguments.name;
  ctx.accounts.attribute.kind = get_attribute_kind(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.attribute.modifier = get_attribute_modifier(arguments.modifier, arguments.size)?;
  ctx.accounts.collection.quantity_of_attributes += 1;
  ctx.accounts.attribute.created_at = ctx.accounts.clock.unix_timestamp;
  ctx.accounts.attribute.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
