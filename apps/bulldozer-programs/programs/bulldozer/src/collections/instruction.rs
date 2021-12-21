use anchor_lang::prelude::*;

#[account]
pub struct Instruction {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: Vec<u8>,
  pub body: Vec<u8>,
}
