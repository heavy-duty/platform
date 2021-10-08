use anchor_lang::prelude::*;
use crate::collections::{InstructionBasicAccount};

#[derive(Accounts)]
pub struct DeleteInstructionBasicAccount<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub account: Account<'info, InstructionBasicAccount>,
    pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstructionBasicAccount>) -> ProgramResult {
    msg!("Delete instruction basic account");
    Ok(())
}
