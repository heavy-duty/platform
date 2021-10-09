use anchor_lang::prelude::*;
use crate::collections::{Application};

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub application: Account<'info, Application>,
    pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteApplication>) -> ProgramResult {
    msg!("Delete application");
    Ok(())
}
