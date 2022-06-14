use crate::collections::Workspace;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetWorkspaceAuthority<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut, 
    has_one = authority @ ErrorCode::UnauthorizedWorkspaceSetAuthority
  )]
  pub workspace: Account<'info, Workspace>,
  /// CHECK: New authority can be any type of account.
  pub new_authority: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<SetWorkspaceAuthority>) -> Result<()> {
  msg!("Set workspace authority");
  ctx.accounts.workspace.authority = ctx.accounts.new_authority.key();
  ctx.accounts.workspace.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
