use anchor_lang::prelude::*;
use crate::collections::{InstructionSignerAccount};
use crate::enums::{MarkAttribute};
use crate::utils::{vectorize_string};

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct UpdateInstructionSignerAccount<'info> {
    #[account(mut, has_one = authority)]
    pub account: Box<Account<'info, InstructionSignerAccount>>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionSignerAccount>, name: String, mark_attribute: u8) -> ProgramResult {
    msg!("Update instruction signer account");
    ctx.accounts.account.name = vectorize_string(name, 32);
    ctx.accounts.account.mark_attribute = MarkAttribute::from_index(mark_attribute)?;
    Ok(())
}
