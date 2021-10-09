use anchor_lang::prelude::*;
use crate::collections::{InstructionSignerAccount};

#[derive(Accounts)]
pub struct DeleteInstructionSignerAccount<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub account: Account<'info, InstructionSignerAccount>,
    pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstructionSignerAccount>) -> ProgramResult {
    msg!("Delete instruction signer account");
    Ok(())
}
