use crate::collections::Workspace;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateWorkspace<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32,
    )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateWorkspace>, name: String) -> ProgramResult {
  msg!("Create workspace");
  ctx.accounts.workspace.name = vectorize_string(name, 32);
  ctx.accounts.workspace.authority = ctx.accounts.authority.key();
  Ok(())
}
