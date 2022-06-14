use crate::collections::Workspace;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteWorkspace<'info> {
  #[account(mut)]
  pub receiver: Signer<'info>,
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = receiver,
    has_one = authority @ ErrorCode::UnauthorizedWorkspaceDelete
  )]
  pub workspace: Account<'info, Workspace>,
}

pub fn handle(_ctx: Context<DeleteWorkspace>) -> Result<()> {
  msg!("Delete workspace");
  Ok(())
}
