use anchor_lang::prelude::*;

#[account]
pub struct Application {
  pub authority: Pubkey,
  pub name: String,
  pub created_at: i64,
  pub updated_at: i64,
  pub bump: u8,
  pub application_stats_bump: u8,
}

impl Application {
  pub fn space() -> usize {
    // discriminator + authority + name (size 32 + 4 ?) +
    // created at + updated at + bump + application stats bump
    8 + 32 + 36 + 8 + 8 + 1 + 1
  }
}
