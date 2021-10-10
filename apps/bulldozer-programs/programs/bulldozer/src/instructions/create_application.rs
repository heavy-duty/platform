use crate::collections::Application;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateApplication<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32,
    )]
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateApplication>, name: String) -> ProgramResult {
  msg!("Create application");
  ctx.accounts.application.name = vectorize_string(name, 32);
  ctx.accounts.application.authority = ctx.accounts.authority.key();
  Ok(())
}
