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
  pub user: Box<Account<'info, User>>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateUser>, arguments: UpdateUserArguments) -> Result<()> {
  msg!("Update user");
  ctx.accounts.user.update(
    arguments.user_name.to_string(),
    arguments.name.to_string(),
    arguments.thumbnail_url.to_string(),
  );
  ctx.accounts.user.bump_timestamp()?;
  Ok(())
}
