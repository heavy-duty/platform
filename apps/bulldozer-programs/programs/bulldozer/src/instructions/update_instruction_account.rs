use crate::collections::{
  AccountClose, AccountCollection, AccountDto, AccountKind, AccountModifier, AccountPayer,
  AccountSpace, BaseAccount, InstructionAccount,
};
use crate::utils::vectorize_string;
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
  ctx.accounts.account.data = BaseAccount {
    name: vectorize_string(dto.name, 32),
    kind: None,
    modifier: None,
    collection: None,
    payer: None,
    close: None,
    space: None,
  };

  ctx.accounts.account.data.set_kind(Some(dto.kind))?;
  ctx
    .accounts
    .account
    .data
    .set_collection(Some(dto.kind), ctx.remaining_accounts)?;
  ctx.accounts.account.data.set_modifier(dto.modifier)?;
  ctx
    .accounts
    .account
    .data
    .set_payer(dto.modifier, ctx.remaining_accounts)?;
  ctx
    .accounts
    .account
    .data
    .set_close(dto.modifier, ctx.remaining_accounts)?;
  ctx
    .accounts
    .account
    .data
    .set_space(dto.modifier, dto.space)?;

  Ok(())
}
