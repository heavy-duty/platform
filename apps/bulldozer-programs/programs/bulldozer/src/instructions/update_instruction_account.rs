use crate::collections::{Collection, InstructionAccount};
use crate::enums::{AccountKind, AccountModifier};
use crate::errors::ErrorCode;
use crate::utils::{get_remaining_account, vectorize_string};
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
  ctx.accounts.account.program = program;

  if kind == 0 {
    ctx.accounts.account.collection =
      match get_remaining_account::<Collection>(ctx.remaining_accounts, 0)? {
        Some(collection) => Some(collection.key()),
        _ => return Err(ErrorCode::MissingCollectionAccount.into()),
      };
    ctx.accounts.account.program = None;
  } else if kind == 1 {
    ctx.accounts.account.collection = None;
    ctx.accounts.account.program = match program {
      Some(program) => Some(program),
      _ => return Err(ErrorCode::MissingProgram.into()),
    };
  } else {
    ctx.accounts.account.collection = None;
    ctx.accounts.account.program = None;
  }

  if modifier == 1 {
    ctx.accounts.account.payer =
      match get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)? {
        Some(payer) => Some(payer.key()),
        _ => return Err(ErrorCode::MissingPayerAccount.into()),
      };
    ctx.accounts.account.space = match space {
      Some(space) => Some(space),
      _ => return Err(ErrorCode::MissingSpace.into()),
    };
    ctx.accounts.account.close = None;
  } else if modifier == 2 {
    ctx.accounts.account.payer = None;
    ctx.accounts.account.space = None;
    ctx.accounts.account.close =
      match get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)? {
        Some(account) => Some(account.key()),
        _ => None,
      };
  } else {
    ctx.accounts.account.payer = None;
    ctx.accounts.account.space = None;
    ctx.accounts.account.close = None;
  }

  Ok(())
}
