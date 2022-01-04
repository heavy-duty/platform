use crate::collections::{Application, Workspace};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateApplication<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + name (size 32 + 4 ?)
        // quantity of collections + quantity of instructions
        space = 8 + 32 + 32 + 36 + 1 + 1,
    )]
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateApplication>, name: String) -> ProgramResult {
  msg!("Create application");
  ctx.accounts.application.name = name;
  ctx.accounts.application.authority = ctx.accounts.authority.key();
  ctx.accounts.application.workspace = ctx.accounts.workspace.key();
  ctx.accounts.application.quantity_of_collections = 0;
  ctx.accounts.application.quantity_of_instructions = 0;
  ctx.accounts.workspace.quantity_of_applications += 1;
  Ok(())
}
