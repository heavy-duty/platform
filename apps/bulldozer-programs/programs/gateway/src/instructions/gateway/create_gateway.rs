use crate::collections::Gateway;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateGateway<'info> {
  pub system_program: Program<'info, System>,
  /// CHECK: this account is only used to generate a PDA in the handler
  pub base: UncheckedAccount<'info>,
  #[account(
    init,
    space = 200,
    payer = authority,
    seeds = [
      b"gateway".as_ref(),
      base.key().as_ref()
    ],
    bump
  )]
  pub gateway: Account<'info, Gateway>,
  #[account(mut)]
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<CreateGateway>) -> Result<()> {
  msg!("Creating gateway");
  ctx.accounts.gateway.authority = ctx.accounts.authority.key();
  ctx.accounts.gateway.bump = *ctx.bumps.get("gateway").unwrap();
  ctx.accounts.gateway.base = ctx.accounts.base.key();
  Ok(())
}
