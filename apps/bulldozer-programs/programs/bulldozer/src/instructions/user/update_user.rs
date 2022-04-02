use crate::collections::User;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateUserArguments {
  user_name: String,
  name: String,
  thumbail_url: String,
}

#[derive(Accounts)]
pub struct UpdateUser<'info> {
  #[account(
    init,
    payer = authority,
    space = User::space(),
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref()
    ],
    bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<UpdateUser>, arguments: UpdateUserArguments) -> Result<()> {
  msg!("Update user");
  ctx.accounts.user.update(
    arguments.user_name.to_string(),
    arguments.name.to_string(),
    arguments.thumbail_url.to_string(),
  );
  ctx.accounts.user.bump_timestamp()?;
  Ok(())
}
