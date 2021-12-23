use crate::collections::{Application, Collection, Workspace};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollection<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + application + string (size 32 + 4 ?)
        space = 8 + 32 + 32 + 32 + 36
    )]
  pub collection: Box<Account<'info, Collection>>,
  pub application: Box<Account<'info, Application>>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateCollection>, name: String) -> ProgramResult {
  msg!("Create collection");
  ctx.accounts.collection.name = name;
  ctx.accounts.collection.authority = ctx.accounts.authority.key();
  ctx.accounts.collection.application = ctx.accounts.application.key();
  ctx.accounts.collection.workspace = ctx.accounts.workspace.key();
  Ok(())
}
