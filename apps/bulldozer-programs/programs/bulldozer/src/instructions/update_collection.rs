use anchor_lang::prelude::*;
use crate::collections::{Collection};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateCollection<'info> {
    #[account(mut, has_one = authority)]
    pub collection: Box<Account<'info, Collection>>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateCollection>, name: String) -> ProgramResult {
    msg!("Update collection");
    ctx.accounts.collection.name = parse_string(name);
    Ok(())
}
