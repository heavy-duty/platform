use crate::collections::Attribute;
use anchor_lang::prelude::*;

#[account]
pub struct InstructionArgument {
  pub authority: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub data: Attribute,
}
