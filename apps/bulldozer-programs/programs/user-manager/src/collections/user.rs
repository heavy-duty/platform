use anchor_lang::prelude::*;

#[account]
pub struct User {
  pub authority: Pubkey,
  pub user_name: String,
  pub name: String,
  pub thumbnail_url: String,
  pub bump: u8,
  pub created_at: i64,
  pub updated_at: i64,
}

impl User {
  pub fn space() -> usize {
    // discriminator + authority + username
    // name + thumbnail + bump
    // created at + updated at
    8 + 32 + 19 + 36 + 304 + 1 + 8 + 8
  }
}
