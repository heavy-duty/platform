use anchor_lang::prelude::*;
use crate::enums::{MarkAttribute};

#[account]
pub struct InstructionSignerAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    pub mark_attribute: MarkAttribute,
}
