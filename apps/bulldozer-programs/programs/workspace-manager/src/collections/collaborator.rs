use crate::enums::CollaboratorStatus;
use anchor_lang::prelude::*;

#[account]
pub struct Collaborator {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub user: Pubkey,
  pub status: CollaboratorStatus,
  pub is_admin: bool,
  pub bump: u8,
  pub created_at: i64,
  pub updated_at: i64,
}

impl Collaborator {
  pub fn initialize(
    &mut self,
    authority: Pubkey,
    workspace: Pubkey,
    user: Pubkey,
    status: CollaboratorStatus,
    is_admin: bool,
    bump: u8,
  ) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.user = user;
    self.status = status;
    self.is_admin = is_admin;
    self.bump = bump;
  }

  pub fn change_status(&mut self, status: CollaboratorStatus) -> () {
    self.status = status;
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
    // discriminator + authority + workspace + user
    // status + bump + created at + updated at + is admin
    8 + 32 + 32 + 32 + 2 + 1 + 8 + 8 + 1
  }
}
