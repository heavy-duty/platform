use crate::collections::User;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateUser<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + bump + created at
    space = 8 + 32 + 1 + 8,
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

pub fn handle(ctx: Context<CreateUser>) -> ProgramResult {
  msg!("Create user");
  ctx.accounts.user.authority = ctx.accounts.authority.key();
  ctx.accounts.user.bump = *ctx.bumps.get("user").unwrap();
  ctx.accounts.user.created_at = Clock::get()?.unix_timestamp;
  Ok(())
}
