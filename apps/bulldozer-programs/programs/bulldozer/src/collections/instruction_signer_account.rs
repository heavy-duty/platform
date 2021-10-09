use anchor_lang::prelude::*;
use crate::enums::{MarkAttribute};

#[account]
pub struct InstructionSignerAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: Vec<u8>,
    pub mark_attribute: MarkAttribute,
}
