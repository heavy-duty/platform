use anchor_lang::prelude::*;

#[account]
pub struct Budget {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub bump: u8,
}
