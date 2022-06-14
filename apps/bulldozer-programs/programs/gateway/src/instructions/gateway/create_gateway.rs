use crate::collections::Gateway;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateGateway<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
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
  #[account(
    init,
    payer = authority,
    seeds = [
      b"gateway_wallet".as_ref(),
      gateway.key().as_ref(),
    ],
    bump,
    space = 0,
    owner = system_program.key(),
  )]
  /// CHECK: the wallet is a system account but it fails when using SystemAccount
  pub gateway_wallet: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<CreateGateway>) -> Result<()> {
  msg!("Creating gateway");
  ctx.accounts.gateway.authority = ctx.accounts.authority.key();
  ctx.accounts.gateway.bump = *ctx.bumps.get("gateway").unwrap();
  ctx.accounts.gateway.base = ctx.accounts.base.key();
  ctx.accounts.gateway.wallet_bump = *ctx.bumps.get("gateway_wallet").unwrap();
  Ok(())
}
