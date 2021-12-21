use crate::collections::Attribute;
use anchor_lang::prelude::*;

#[account]
pub struct CollectionAttribute {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub collection: Pubkey,
  pub data: Attribute,
}
