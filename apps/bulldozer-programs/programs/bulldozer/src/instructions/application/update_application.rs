use crate::collections::Application;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateApplication<'info> {
  #[account(mut, has_one = authority)]
  pub application: Box<Account<'info, Application>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateApplication>, name: String) -> ProgramResult {
  msg!("Update application");
  ctx.accounts.application.name = name;
  Ok(())
}
