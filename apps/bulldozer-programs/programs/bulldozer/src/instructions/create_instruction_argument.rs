use anchor_lang::prelude::*;
use crate::collections::{Application, Instruction, InstructionArgument};
use crate::enums::{AttributeKind, AttributeKindModifier};
use crate::utils::{vectorize_string};

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, array_size: u8)]
pub struct CreateInstructionArgument<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 3 + 3,
    )]
    pub argument: Box<Account<'info, InstructionArgument>>,
    pub application: Box<Account<'info, Application>>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionArgument>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
    msg!("Create instruction argument");
    ctx.accounts.argument.name = vectorize_string(name, 32);
    ctx.accounts.argument.kind = AttributeKind::from_index(kind)?;
    ctx.accounts.argument.modifier = AttributeKindModifier::from_index(modifier, size)?;
    ctx.accounts.argument.authority = ctx.accounts.authority.key();
    ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
    ctx.accounts.argument.application = ctx.accounts.application.key();
    Ok(())
}
