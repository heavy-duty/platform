use crate::collections::Application;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  pub application_authority: Signer<'info>,
  #[account(
    mut,
    close = authority,
    constraint = application.authority == application_authority.key() @ ErrorCode::UnauthorizedApplicationDelete
  )]
  pub application: Account<'info, Application>,
}

pub fn handle(_ctx: Context<DeleteApplication>) -> Result<()> {
  msg!("Delete application");
  Ok(())
}
