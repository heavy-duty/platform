use anchor_lang::prelude::*;

#[account]
pub struct Collection {
  pub id: u32,
  pub authority: Pubkey,
  pub owner: Pubkey,
  pub name: String,
  pub created_at: i64,
  pub updated_at: i64,
  pub bump: u8,
}

impl Collection {
  pub fn space() -> usize {
    // discriminator + authority + workspace + application + string (size 32 + 4 ?)
    // created at + updated at + collection stats bump
    8 + 32 + 32 + 32 + 36 + 8 + 8 + 1
  }
}
