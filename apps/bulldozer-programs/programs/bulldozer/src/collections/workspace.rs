use anchor_lang::prelude::*;

#[account]
pub struct Workspace {
  pub authority: Pubkey,
  pub name: String,
  pub quantity_of_applications: u8,
}
