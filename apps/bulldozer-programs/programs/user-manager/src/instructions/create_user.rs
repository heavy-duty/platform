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
  pub user: Account<'info, User>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CreateUser>, arguments: CreateUserArguments) -> Result<()> {
  msg!("Create user");
  ctx.accounts.user.authority = ctx.accounts.authority.key();
  ctx.accounts.user.user_name = arguments.user_name;
  ctx.accounts.user.name = arguments.name;
  ctx.accounts.user.thumbnail_url = arguments.thumbnail_url;
  ctx.accounts.user.bump = *ctx.bumps.get("user").unwrap();
  ctx.accounts.user.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.user.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
