use crate::collections::User;
use anchor_lang::prelude::*;

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

pub fn handle(ctx: Context<CreateUser>) -> ProgramResult {
  msg!("Create user");
  ctx
    .accounts
    .user
    .initialize(*ctx.accounts.authority.key, *ctx.bumps.get("user").unwrap());
  ctx.accounts.user.initialize_timestamp()?;
  Ok(())
}
