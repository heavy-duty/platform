use anchor_lang::prelude::*;
use crate::enums::{AccountKind, AccountModifier};

#[account]
pub struct InstructionAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: Vec<u8>,
    pub kind: AccountKind,
    pub modifier: AccountModifier,
    pub program: Option<Pubkey>,
    pub payer: Option<Pubkey>,
    pub close: Option<Pubkey>,
    pub space: Option<u16>,
}
