use anchor_lang::prelude::*;

#[account]
pub struct User {
  pub authority: Pubkey,
  pub bump: u8,
  pub created_at: i64,
}

impl User {
  pub fn initialize(&mut self, authority: Pubkey, bump: u8) -> () {
    self.authority = authority;
    self.bump = bump;
  }

  pub fn initialize_timestamp(&mut self) -> Result<()> {
    self.created_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + bump + created at
    8 + 32 + 1 + 8
  }
}
