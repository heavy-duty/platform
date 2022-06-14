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
  pub fn space() -> usize {
    // discriminator + authority + workspace + user
    // status + bump + created at + updated at + is admin
    8 + 32 + 32 + 32 + 2 + 1 + 8 + 8 + 1
  }
}
