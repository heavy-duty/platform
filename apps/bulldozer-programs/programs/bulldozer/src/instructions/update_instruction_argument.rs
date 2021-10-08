use anchor_lang::prelude::*;
use crate::collections::{InstructionArgument};
use crate::enums::{AttributeKind, AttributeKindModifier};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, array_size: u8)]
pub struct UpdateInstructionArgument<'info> {
    #[account(mut, has_one = authority)]
    pub argument: Box<Account<'info, InstructionArgument>>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionArgument>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
    msg!("Update instruction argument");
    ctx.accounts.argument.name = parse_string(name);
    ctx.accounts.argument.kind = AttributeKind::from_index(kind)?;
    ctx.accounts.argument.modifier = AttributeKindModifier::from_index(modifier, size)?;
    Ok(())
}
