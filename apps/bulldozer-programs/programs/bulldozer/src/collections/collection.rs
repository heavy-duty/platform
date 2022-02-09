use anchor_lang::prelude::*;

#[account]
pub struct Collection {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: String,
  pub quantity_of_attributes: u8,
  pub created_at: i64,
  pub updated_at: i64,
}
