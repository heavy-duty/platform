use anchor_lang::prelude::*;

#[account]
pub struct Application {
  pub authority: Pubkey,
  pub name: Vec<u8>,
}
