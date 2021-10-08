use anchor_lang::prelude::*;
use crate::enums::{AttributeKind, AttributeKindModifier};

#[account]
pub struct InstructionArgument {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: Vec<u8>,
    pub kind: AttributeKind,
    pub modifier: AttributeKindModifier,
}
