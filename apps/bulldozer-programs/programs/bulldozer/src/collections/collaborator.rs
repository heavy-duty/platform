use anchor_lang::prelude::*;

#[account]
pub struct Collaborator {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub user: Pubkey,
  pub bump: u8,
  pub created_at: i64,
}

impl Collaborator {
  pub fn initialize(&mut self, authority: Pubkey, workspace: Pubkey, user: Pubkey, bump: u8) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.user = user;
    self.bump = bump;
  }

  pub fn initialize_timestamp(&mut self) -> ProgramResult {
    self.created_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + workspace + user
    // bump + created at
    8 + 32 + 32 + 32 + 1 + 8
  }
}
