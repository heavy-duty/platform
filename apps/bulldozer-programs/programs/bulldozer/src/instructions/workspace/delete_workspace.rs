use crate::collections::Workspace;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteWorkspace<'info> {
  #[account(mut, has_one = authority, close = authority)]
  pub workspace: Account<'info, Workspace>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteWorkspace>) -> ProgramResult {
  msg!("Delete workspace");
  Ok(())
}
