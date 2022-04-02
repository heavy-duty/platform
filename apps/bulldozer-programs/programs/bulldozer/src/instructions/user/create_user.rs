use crate::collections::User;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateUserArguments {
  user_name: String,
  name: String,
  thumbnail_url: String,
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
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

pub fn handle(ctx: Context<CreateUser>, arguments: CreateUserArguments) -> Result<()> {
  msg!("Create user");
  ctx.accounts.user.initialize(
    *ctx.accounts.authority.key,
    arguments.user_name.to_string(),
    arguments.name.to_string(),
    arguments.thumbnail_url.to_string(),
    *ctx.bumps.get("user").unwrap(),
  );
  ctx.accounts.user.initialize_timestamp()?;
  Ok(())
}
