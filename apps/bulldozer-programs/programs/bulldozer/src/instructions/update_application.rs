use anchor_lang::prelude::*;
use crate::collections::{Application};
use crate::utils::{parse_string};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateApplication<'info> {
    #[account(mut, has_one = authority)]
    pub application: Box<Account<'info, Application>>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateApplication>, name: String) -> ProgramResult {
  msg!("Update application");
  ctx.accounts.application.name = parse_string(name);
  Ok(())
}
