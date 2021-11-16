use crate::collections::{AccountDto, BaseAccount, InstructionAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AccountDto)]
pub struct UpdateInstructionAccount<'info> {
  #[account(mut, has_one = authority)]
  pub account: Box<Account<'info, InstructionAccount>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionAccount>, dto: AccountDto) -> ProgramResult {
  msg!("Update instruction account");
  ctx.accounts.account.data = BaseAccount::create(dto, ctx.remaining_accounts)?;

  Ok(())
}
