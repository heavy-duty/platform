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
  pub fn initialize(
    &mut self,
    authority: Pubkey,
    user_name: String,
    name: String,
    thumbnail_url: String,
    bump: u8,
  ) -> () {
    self.authority = authority;
    self.user_name = user_name;
    self.name = name;
    self.thumbnail_url = thumbnail_url;
    self.bump = bump;
  }

  pub fn update(&mut self, user_name: String, name: String, thumbnail_url: String) -> () {
    self.user_name = user_name;
    self.name = name;
    self.thumbnail_url = thumbnail_url;
  }

  pub fn initialize_timestamp(&mut self) -> Result<()> {
    self.created_at = Clock::get()?.unix_timestamp;
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn bump_timestamp(&mut self) -> Result<()> {
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + username
    // name + thumbnail + bump
    // created at + updated at
    8 + 32 + 19 + 36 + 304 + 1 + 8 + 8
  }
}
