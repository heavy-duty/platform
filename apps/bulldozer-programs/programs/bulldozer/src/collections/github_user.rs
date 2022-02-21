use anchor_lang::prelude::*;

#[account]
pub struct GithubUser {
  pub authority: Pubkey,
  pub handle: String,
  pub bump: u8,
  pub created_at: i64,
}

impl GithubUser {
  pub fn initialize(&mut self, authority: Pubkey, handle: String, bump: u8) -> () {
    self.authority = authority;
    self.handle = handle;
    self.bump = bump;
  }

  pub fn space() -> usize {
    // discriminator + authority + bump + created at
    8 + 32 + 36 + 1 + 8
  }
}
