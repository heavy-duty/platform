use crate::collections::Workspace;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateWorkspace<'info> {
  #[account(mut, has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateWorkspace>, name: String) -> ProgramResult {
  msg!("Update workspace");
  ctx.accounts.workspace.name = name;
  Ok(())
}
