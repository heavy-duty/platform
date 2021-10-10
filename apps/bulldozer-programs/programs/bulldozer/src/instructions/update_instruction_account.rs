use crate::collections::InstructionAccount;
use crate::enums::{AccountKind, AccountModifier};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, space: Option<u16>, program: Option<Pubkey>)]
pub struct UpdateInstructionAccount<'info> {
  #[account(mut, has_one = authority)]
  pub account: Box<Account<'info, InstructionAccount>>,
  pub authority: Signer<'info>,
}

pub fn handler(
  ctx: Context<UpdateInstructionAccount>,
  name: String,
  kind: u8,
  modifier: u8,
  space: Option<u16>,
  program: Option<Pubkey>,
) -> ProgramResult {
  msg!("Update instruction account");
  ctx.accounts.account.name = vectorize_string(name, 32);
  ctx.accounts.account.kind = AccountKind::from_index(kind)?;
  ctx.accounts.account.modifier = AccountModifier::from_index(modifier)?;
  ctx
    .accounts
    .account
    .set_kind(kind, ctx.remaining_accounts, program)?;
  ctx
    .accounts
    .account
    .set_modifier(modifier, ctx.remaining_accounts, space)?;

  Ok(())
}
