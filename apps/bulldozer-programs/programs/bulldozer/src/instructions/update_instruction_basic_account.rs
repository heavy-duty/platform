use anchor_lang::prelude::*;
use crate::collections::{Collection, InstructionBasicAccount};
use crate::enums::{MarkAttribute};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct UpdateInstructionBasicAccount<'info> {
    #[account(mut, has_one = authority)]
    pub account: Box<Account<'info, InstructionBasicAccount>>,
    pub collection: Box<Account<'info, Collection>>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionBasicAccount>, name: String, mark_attribute: u8) -> ProgramResult {
    msg!("Update instruction basic account");
    ctx.accounts.account.name = parse_string(name);
    ctx.accounts.account.collection = ctx.accounts.collection.key();
    ctx.accounts.account.mark_attribute = MarkAttribute::from_index(mark_attribute)?;
    Ok(())
}
