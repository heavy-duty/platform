use crate::collections::User;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateUserArguments {
  user_name: String,
  name: String,
  thumbnail_url: String,
}

#[derive(Accounts)]
pub struct UpdateUser<'info> {
  #[account(
    mut,
    has_one = authority,
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref()
    ],
    bump = user.bump
  )]
  pub user: Account<'info, User>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateUser>, arguments: UpdateUserArguments) -> Result<()> {
  msg!("Update user");
  ctx.accounts.user.user_name = arguments.user_name;
  ctx.accounts.user.name = arguments.name;
  ctx.accounts.user.thumbnail_url = arguments.thumbnail_url;
  ctx.accounts.user.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
