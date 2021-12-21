use crate::collections::{Application, Collection, Workspace};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollection<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32
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
  ctx.accounts.collection.name = vectorize_string(name, 32);
  ctx.accounts.collection.authority = ctx.accounts.authority.key();
  ctx.accounts.collection.application = ctx.accounts.application.key();
  ctx.accounts.collection.workspace = ctx.accounts.workspace.key();
  Ok(())
}
