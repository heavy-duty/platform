use anchor_lang::prelude::*;
use crate::collections::{Instruction};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateInstruction<'info> {
    #[account(mut, has_one = authority)]
    pub instruction: Box<Account<'info, Instruction>>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstruction>, name: String) -> ProgramResult {
    msg!("Update instruction");
    ctx.accounts.instruction.name = parse_string(name);
    Ok(())
}
