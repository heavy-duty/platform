use anchor_lang::prelude::*;

#[account]
pub struct Application {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub name: String,
  pub quantity_of_collections: u8,
  pub quantity_of_instructions: u8,
  pub created_at: i64,
  pub updated_at: i64,
}
