use anchor_lang::prelude::*;
use crate::enums::{AttributeKind, AttributeKindModifier};

#[account]
pub struct CollectionAttribute {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub name: Vec<u8>,
    pub kind: AttributeKind,
    pub modifier: AttributeKindModifier,
}
