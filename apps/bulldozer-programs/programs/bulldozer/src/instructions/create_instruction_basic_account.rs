use anchor_lang::prelude::*;
use crate::collections::{Application, Collection, Instruction, InstructionBasicAccount};
use crate::enums::{MarkAttribute};
use crate::utils::{vectorize_string};

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct CreateInstructionBasicAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2
    )]
    pub account: Box<Account<'info, InstructionBasicAccount>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionBasicAccount>, name: String, mark_attribute: u8) -> ProgramResult {
    msg!("Create instruction basic account");
    ctx.accounts.account.authority = ctx.accounts.authority.key();
    ctx.accounts.account.application = ctx.accounts.application.key();
    ctx.accounts.account.instruction = ctx.accounts.instruction.key();
    ctx.accounts.account.name = vectorize_string(name, 32);
    ctx.accounts.account.collection = ctx.accounts.collection.key();
    ctx.accounts.account.mark_attribute = MarkAttribute::from_index(mark_attribute)?;
    Ok(())
}
