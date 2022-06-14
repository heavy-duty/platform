use crate::collections::Application;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
  #[account(mut)]
  pub receiver: Signer<'info>,
  pub authority: Signer<'info>,
  #[account(
    mut,
    close = receiver,
    has_one = authority @ ErrorCode::UnauthorizedApplicationDelete
  )]
  pub application: Account<'info, Application>,
}

pub fn handle(_ctx: Context<DeleteApplication>) -> Result<()> {
  msg!("Delete application");
  Ok(())
}
