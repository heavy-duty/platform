use anchor_lang::prelude::*;

#[account]
pub struct Collaborator {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub user: Pubkey,
  pub bump: u8,
  pub created_at: i64,
}
