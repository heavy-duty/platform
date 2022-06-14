use anchor_lang::prelude::*;

#[account]
pub struct Application {
  pub id: u32,
  pub authority: Pubkey,
  pub owner: Pubkey,
  pub name: String,
  pub created_at: i64,
  pub updated_at: i64,
  pub bump: u8,
}

impl Application {
  pub fn space() -> usize {
    // discriminator + authority + owner + name (size 32 + 4 ?) +
    // created at + updated at + bump + id
    8 + 32 + 32 + 36 + 8 + 8 + 1 + 1 + 4
  }
}
