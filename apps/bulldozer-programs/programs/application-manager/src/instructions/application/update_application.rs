use crate::collections::Application;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateApplicationArguments {
  pub name: String,
  pub quantity_of_instructions: u8,
  pub quantity_of_collections: u8,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateApplicationArguments)]
pub struct UpdateApplication<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    has_one = authority @ ErrorCode::UnauthorizedApplicationUpdate
  )]
  pub application: Account<'info, Application>,
}

pub fn handle(
  ctx: Context<UpdateApplication>,
  arguments: UpdateApplicationArguments,
) -> Result<()> {
  msg!("Update application");
  ctx.accounts.application.name = arguments.name;
  ctx.accounts.application.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
