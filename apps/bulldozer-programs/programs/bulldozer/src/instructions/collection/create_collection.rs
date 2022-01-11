use crate::collections::{Application, Collection, Workspace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionArguments)]
pub struct CreateCollection<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + application + string (size 32 + 4 ?)
        // quantity of attributes + created at + updated at
        space = 8 + 32 + 32 + 32 + 36 + 1 + 8 + 8
    )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(mut)]
  pub application: Box<Account<'info, Application>>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handle(ctx: Context<CreateCollection>, arguments: CreateCollectionArguments) -> ProgramResult {
  msg!("Create collection");
  ctx.accounts.collection.name = arguments.name;
  ctx.accounts.collection.authority = ctx.accounts.authority.key();
  ctx.accounts.collection.application = ctx.accounts.application.key();
  ctx.accounts.collection.workspace = ctx.accounts.workspace.key();
  ctx.accounts.collection.quantity_of_attributes = 0;
  ctx.accounts.application.quantity_of_collections += 1;
  ctx.accounts.collection.created_at = ctx.accounts.clock.unix_timestamp;
  ctx.accounts.collection.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
