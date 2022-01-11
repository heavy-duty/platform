use crate::enums::{AccountKinds, AccountModifiers};
use anchor_lang::prelude::*;

#[account]
pub struct InstructionAccount {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub name: String,
  pub kind: AccountKinds,
  pub modifier: Option<AccountModifiers>,
  pub collection: Option<Pubkey>,
  pub payer: Option<Pubkey>,
  pub close: Option<Pubkey>,
  pub space: Option<u16>,
  pub quantity_of_relations: u8,
  pub created_at: i64,
  pub updated_at: i64,
}
