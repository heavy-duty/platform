use anchor_lang::prelude::*;

#[account]
pub struct User {
  pub authority: Pubkey,
  pub bump: u8,
  pub created_at: i64,
}
