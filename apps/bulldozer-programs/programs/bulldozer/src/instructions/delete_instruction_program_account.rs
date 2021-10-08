use anchor_lang::prelude::*;
use crate::collections::{InstructionProgramAccount};

#[derive(Accounts)]
pub struct DeleteInstructionProgramAccount<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub account: Account<'info, InstructionProgramAccount>,
    pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstructionProgramAccount>) -> ProgramResult {
    msg!("Delete instruction program account");
    Ok(())
}
