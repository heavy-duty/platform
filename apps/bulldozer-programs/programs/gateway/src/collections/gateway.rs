use anchor_lang::prelude::*;

#[account]
pub struct Gateway {
  pub authority: Pubkey,
  pub base: Pubkey,
  pub bump: u8,
}
