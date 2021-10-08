use anchor_lang::prelude::*;
use crate::collections::{Application, Instruction, InstructionProgramAccount};
use crate::utils::{vectorize_string};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateInstructionProgramAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2
    )]
    pub account: Box<Account<'info, InstructionProgramAccount>>,
    pub application: Box<Account<'info, Application>>,
    #[account(executable)]
    pub program: UncheckedAccount<'info>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionProgramAccount>, name: String) -> ProgramResult {
    msg!("Create instruction program account");
    ctx.accounts.account.authority = ctx.accounts.authority.key();
    ctx.accounts.account.application = ctx.accounts.application.key();
    ctx.accounts.account.instruction = ctx.accounts.instruction.key();
    ctx.accounts.account.name = vectorize_string(name, 32);
    ctx.accounts.account.program = ctx.accounts.program.key();
    Ok(())
}
