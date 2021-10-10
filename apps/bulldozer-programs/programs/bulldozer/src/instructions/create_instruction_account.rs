use anchor_lang::prelude::*;
use crate::collections::{Application, Instruction, InstructionAccount};
use crate::enums::{AccountKind, AccountModifier};
use crate::utils::{vectorize_string};

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8)]
pub struct CreateInstructionAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2
    )]
    pub account: Box<Account<'info, InstructionAccount>>,
    pub application: Box<Account<'info, Application>>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionAccount>, name: String, kind: u8, modifier: u8) -> ProgramResult {
    msg!("Create instruction basic account");
    ctx.accounts.account.authority = ctx.accounts.authority.key();
    ctx.accounts.account.application = ctx.accounts.application.key();
    ctx.accounts.account.instruction = ctx.accounts.instruction.key();
    ctx.accounts.account.name = vectorize_string(name, 32);
    ctx.accounts.account.kind = AccountKind::from_index(kind)?;
    ctx.accounts.account.modifier = AccountModifier::from_index(modifier)?;
    Ok(())
}
