use anchor_lang::prelude::*;

#[account]
pub struct InstructionRelation {
  pub authority: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub from: Pubkey,
  pub to: Pubkey,
}
