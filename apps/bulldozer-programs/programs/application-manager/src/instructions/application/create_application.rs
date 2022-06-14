use crate::collections::Application;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateApplicationArguments {
  pub id: u8,
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateApplicationArguments)]
pub struct CreateApplication<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    init,
    payer = authority,
    space = Application::space(),
    seeds = [
      b"application".as_ref(),
      arguments.id.to_le_bytes().as_ref(),
    ],
    bump,
  )]
  pub application: Account<'info, Application>,
}

pub fn handle(
  ctx: Context<CreateApplication>,
  arguments: CreateApplicationArguments,
) -> Result<()> {
  msg!("Create application");
  ctx.accounts.application.name = arguments.name;
  ctx.accounts.application.authority = ctx.accounts.authority.key();
  ctx.accounts.application.bump = *ctx.bumps.get("application").unwrap();
  ctx.accounts.application.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.application.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
