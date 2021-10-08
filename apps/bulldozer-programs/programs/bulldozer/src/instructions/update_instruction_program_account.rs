use anchor_lang::prelude::*;
use crate::collections::{InstructionProgramAccount};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateInstructionProgramAccount<'info> {
    #[account(mut, has_one = authority)]
    pub account: Box<Account<'info, InstructionProgramAccount>>,
    #[account(executable)]
    pub program: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionProgramAccount>, name: String) -> ProgramResult {
    msg!("Update instruction program account");
    ctx.accounts.account.name = parse_string(name);
    ctx.accounts.account.program = ctx.accounts.program.key();
    Ok(())
}
