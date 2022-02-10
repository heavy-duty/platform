use crate::collections::Application;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateApplicationArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateApplicationArguments)]
pub struct UpdateApplication<'info> {
  #[account(mut, has_one = authority)]
  pub application: Box<Account<'info, Application>>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateApplication>, arguments: UpdateApplicationArguments) -> ProgramResult {
  msg!("Update application");
  ctx.accounts.application.name = arguments.name;
  ctx.accounts.application.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
