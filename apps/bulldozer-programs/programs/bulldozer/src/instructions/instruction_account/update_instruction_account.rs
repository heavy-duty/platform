use crate::collections::{Collection, InstructionAccount};
use anchor_lang::prelude::*;
use crate::enums::{get_account_kind, get_account_modifier};
use crate::utils::{get_remaining_account, get_account_key};
use crate::errors::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionAccountArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub space: Option<u16>,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionAccountArguments)]
pub struct UpdateInstructionAccount<'info> {
  #[account(mut, has_one = authority)]
  pub account: Box<Account<'info, InstructionAccount>>,
  pub authority: Signer<'info>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn validate(ctx: &Context<UpdateInstructionAccount>, arguments: &UpdateInstructionAccountArguments) -> std::result::Result<bool, ProgramError> {
  match (
    arguments.kind,
    get_remaining_account::<Collection>(ctx.remaining_accounts, 0)?,
    arguments.modifier,
    arguments.space,
    get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?
  ) {
    (0, None, _, _, _) => Err(ErrorCode::MissingCollectionAccount.into()),
    (_, _, Some(0), None, _) => Err(ErrorCode::MissingSpace.into()),
    (_, _, Some(0), _, None) => Err(ErrorCode::MissingPayerAccount.into()),
    _ => Ok(true)
  }
}

pub fn handler(ctx: Context<UpdateInstructionAccount>, arguments: UpdateInstructionAccountArguments) -> ProgramResult {
  msg!("Update instruction account");
  ctx.accounts.account.name = arguments.name;
  ctx.accounts.account.kind = get_account_kind(
    arguments.kind,
    get_account_key(
      get_remaining_account::<Collection>(ctx.remaining_accounts, 0)?
    )?
  )?;
  ctx.accounts.account.modifier = get_account_modifier(
    arguments.modifier,
    arguments.space,
    get_account_key(
      get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?
    )?,
    get_account_key(
      get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?
    )?
  )?;
  ctx.accounts.account.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
