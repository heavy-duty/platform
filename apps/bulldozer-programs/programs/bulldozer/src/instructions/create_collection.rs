use anchor_lang::prelude::*;
use crate::collections::{Application, Collection};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32
    )]
    pub collection: Box<Account<'info, Collection>>,
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateCollection>, name: String) -> ProgramResult {
    msg!("Create collection");
    ctx.accounts.collection.name = parse_string(name);
    ctx.accounts.collection.authority = ctx.accounts.authority.key();
    ctx.accounts.collection.application = ctx.accounts.application.key();
    Ok(())
}
