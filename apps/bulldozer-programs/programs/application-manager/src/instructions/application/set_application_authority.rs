use crate::collections::Application;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetApplicationAuthority<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut, 
    has_one = authority @ ErrorCode::UnauthorizedApplicationSetAuthority
  )]
  pub application: Account<'info, Application>,
  /// CHECK: New authority can be any type of account.
  pub new_authority: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<SetApplicationAuthority>) -> Result<()> {
  msg!("Set application authority");
  ctx.accounts.application.authority = ctx.accounts.new_authority.key();
  ctx.accounts.application.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
