use anchor_lang::prelude::*;

#[account]
pub struct Collection {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: String,
  pub quantity_of_attributes: u8
}
