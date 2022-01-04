use crate::collections::{
  Application, Attribute, AttributeDto, Collection, CollectionAttribute, Workspace,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AttributeDto)]
pub struct CreateCollectionAttribute<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + application
        // collection + name (size 32 + 4 ?) + kind + modifier
        space = 8 + 32 + 32 + 32 + 32 + 36 + 6 + 6
    )]
  pub attribute: Box<Account<'info, CollectionAttribute>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub collection: Box<Account<'info, Collection>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateCollectionAttribute>, dto: AttributeDto) -> ProgramResult {
  msg!("Create collection attribute");
  ctx.accounts.attribute.authority = ctx.accounts.authority.key();
  ctx.accounts.attribute.workspace = ctx.accounts.workspace.key();
  ctx.accounts.attribute.application = ctx.accounts.application.key();
  ctx.accounts.attribute.collection = ctx.accounts.collection.key();
  ctx.accounts.attribute.data = Attribute::create(dto)?;
  ctx.accounts.collection.quantity_of_attributes += 1;
  Ok(())
}