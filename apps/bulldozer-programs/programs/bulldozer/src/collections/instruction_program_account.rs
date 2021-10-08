use anchor_lang::prelude::*;

#[account]
pub struct InstructionProgramAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: Vec<u8>,
    // program associated to the account
    pub program: Pubkey,
}
