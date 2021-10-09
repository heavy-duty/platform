use anchor_lang::prelude::*;
use crate::collections::{Application, Instruction};
use crate::utils::{vectorize_string};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateInstruction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32
    )]
    pub instruction: Box<Account<'info, Instruction>>,
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstruction>, name: String) -> ProgramResult {
    msg!("Create instruction");
    ctx.accounts.instruction.name = vectorize_string(name, 32);
    ctx.accounts.instruction.authority = ctx.accounts.authority.key();
    ctx.accounts.instruction.application = ctx.accounts.application.key();
    Ok(())
}
