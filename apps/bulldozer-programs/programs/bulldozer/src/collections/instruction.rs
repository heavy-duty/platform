use anchor_lang::prelude::*;

#[account]
pub struct Instruction {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub name: Vec<u8>,
}
