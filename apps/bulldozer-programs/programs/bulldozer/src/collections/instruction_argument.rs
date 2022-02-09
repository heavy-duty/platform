use crate::enums::{AttributeKinds, AttributeModifiers};
use anchor_lang::prelude::*;

#[account]
pub struct InstructionArgument {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub name: String,
  pub kind: AttributeKinds,
  pub modifier: Option<AttributeModifiers>,
  pub created_at: i64,
  pub updated_at: i64,
}
