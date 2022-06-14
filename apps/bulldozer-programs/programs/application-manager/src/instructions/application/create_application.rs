use crate::collections::Application;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateApplicationArguments {
  pub id: u32,
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateApplicationArguments)]
pub struct CreateApplication<'info> {
  pub system_program: Program<'info, System>,
  /// CHECK: An application owner can be anything
  pub owner: UncheckedAccount<'info>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    init,
    payer = authority,
    space = Application::space(),
    seeds = [
      b"application".as_ref(),
      owner.key().as_ref(),
      &arguments.id.to_le_bytes(),
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
  ctx.accounts.application.id = arguments.id;
  ctx.accounts.application.name = arguments.name;
  ctx.accounts.application.bump = *ctx.bumps.get("application").unwrap();
  ctx.accounts.application.authority = ctx.accounts.authority.key();
  ctx.accounts.application.owner = ctx.accounts.owner.key();
  ctx.accounts.application.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.application.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
