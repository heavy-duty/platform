use anchor_lang::prelude::*;
use crate::enums::{MarkAttribute};

#[account]
pub struct InstructionBasicAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    // collection associated to the account
    pub collection: Pubkey,
    pub mark_attribute: MarkAttribute,
}
