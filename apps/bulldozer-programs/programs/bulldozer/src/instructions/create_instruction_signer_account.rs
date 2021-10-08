use anchor_lang::prelude::*;
use crate::collections::{Application, Instruction, InstructionSignerAccount};
use crate::enums::{MarkAttribute};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct CreateInstructionSignerAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 2
    )]
    pub account: Box<Account<'info, InstructionSignerAccount>>,
    pub application: Box<Account<'info, Application>>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionSignerAccount>, name: String, mark_attribute: u8) -> ProgramResult {
    msg!("Create instruction signer account");
    ctx.accounts.account.authority = ctx.accounts.authority.key();
    ctx.accounts.account.application = ctx.accounts.application.key();
    ctx.accounts.account.instruction = ctx.accounts.instruction.key();
    ctx.accounts.account.name = parse_string(name);
    ctx.accounts.account.mark_attribute = MarkAttribute::from_index(mark_attribute)?;
    Ok(())
}
