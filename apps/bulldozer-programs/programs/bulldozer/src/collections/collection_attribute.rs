use crate::enums::{AttributeKind, AttributeKindModifier};
use anchor_lang::prelude::*;

#[account]
pub struct CollectionAttribute {
  pub authority: Pubkey,
  pub application: Pubkey,
  pub collection: Pubkey,
  pub name: Vec<u8>,
  pub kind: AttributeKind,
  pub modifier: AttributeKindModifier,
}
