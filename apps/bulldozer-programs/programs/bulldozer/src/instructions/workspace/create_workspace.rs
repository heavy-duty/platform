use crate::collections::Workspace;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateWorkspace<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + name (size 32 + 4 ?)
        // quantity of apps
        space = 8 + 32 + 36 + 1,
    )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateWorkspace>, name: String) -> ProgramResult {
  msg!("Create workspace");
  ctx.accounts.workspace.name = name;
  ctx.accounts.workspace.authority = ctx.accounts.authority.key();
  ctx.accounts.workspace.quantity_of_applications = 0;
  Ok(())
}
