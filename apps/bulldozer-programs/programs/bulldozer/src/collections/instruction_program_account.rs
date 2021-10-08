use anchor_lang::prelude::*;

#[account]
pub struct InstructionProgramAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    // program associated to the account
    pub program: Pubkey,
}
