use crate::collections::User;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteUser<'info> {
  #[account(
    mut,
    close = authority,
    has_one = authority,
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(mut)]
  pub authority: Signer<'info>,
}

pub fn handle(_ctx: Context<DeleteUser>) -> Result<()> {
  msg!("Delete user");
  Ok(())
}
