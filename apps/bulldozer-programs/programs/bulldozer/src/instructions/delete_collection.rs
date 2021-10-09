use anchor_lang::prelude::*;
use crate::collections::{Collection};

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub collection: Account<'info, Collection>,
    pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteCollection>) -> ProgramResult {
    msg!("Delete collection");
    Ok(())
}
