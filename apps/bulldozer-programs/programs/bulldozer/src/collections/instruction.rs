use anchor_lang::prelude::*;

#[account]
pub struct Instruction {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: String,
  pub body: String,
  pub quantity_of_arguments: u8,
  pub quantity_of_accounts: u8,
}
