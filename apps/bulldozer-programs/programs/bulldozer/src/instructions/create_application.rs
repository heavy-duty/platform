use crate::collections::{Application, Workspace};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateApplication<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32,
    )]
  pub application: Box<Account<'info, Application>>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateApplication>, name: String) -> ProgramResult {
  msg!("Create application");
  ctx.accounts.application.name = vectorize_string(name, 32);
  ctx.accounts.application.authority = ctx.accounts.authority.key();
  ctx.accounts.application.workspace = ctx.accounts.workspace.key();
  Ok(())
}
