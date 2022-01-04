use anchor_lang::prelude::*;

#[account]
pub struct Application {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub name: String,
  pub quantity_of_collections: u8,
}
