use crate::collections::Application;
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority,
    constraint = application.quantity_of_collections == 0 @ ErrorCode::CantDeleteApplicationWithCollections,
  )]
  pub application: Account<'info, Application>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteApplication>) -> ProgramResult {
  msg!("Delete application");
  Ok(())
}
