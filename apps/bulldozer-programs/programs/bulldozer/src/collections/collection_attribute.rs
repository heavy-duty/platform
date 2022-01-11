use crate::enums::{AttributeKinds, AttributeModifiers};
use anchor_lang::prelude::*;

#[account]
pub struct CollectionAttribute {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub collection: Pubkey,
  pub name: String,
  pub kind: Option<AttributeKinds>,
  pub modifier: Option<AttributeModifiers>,
  pub created_at: i64,
  pub updated_at: i64,
}
