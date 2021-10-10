use crate::collections::Application;
use crate::utils::vectorize_string;
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
  ctx.accounts.application.name = vectorize_string(name, 32);
  Ok(())
}
