use anchor_lang::prelude::*;

#[account]
pub struct Collection {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub name: [u8; 32],
}
