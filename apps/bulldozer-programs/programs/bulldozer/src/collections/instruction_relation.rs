use anchor_lang::prelude::*;

#[account]
pub struct InstructionRelation {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub from: Pubkey,
  pub to: Pubkey,
  pub bump: u8,
  pub created_at: i64,
  pub updated_at: i64,
}
