use crate::collections::{Collaborator, Collection, InstructionAccount, User, Workspace};
use crate::enums::{get_account_kind, get_account_modifier};
use crate::errors::ErrorCode;
use crate::utils::{get_account_key, get_remaining_account};
use anchor_lang::prelude::*;

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
  pub workspace: Box<Account<'info, Workspace>>,
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn validate(
  ctx: &Context<UpdateInstructionAccount>,
  arguments: &UpdateInstructionAccountArguments,
) -> std::result::Result<bool, ProgramError> {
  match (
    arguments.kind,
    get_remaining_account::<Collection>(ctx.remaining_accounts, 0)?,
    arguments.modifier,
    arguments.space,
    get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?,
  ) {
    (0, None, _, _, _) => Err(ErrorCode::MissingCollectionAccount.into()),
    (_, _, Some(0), None, _) => Err(ErrorCode::MissingSpace.into()),
    (_, _, Some(0), _, None) => Err(ErrorCode::MissingPayerAccount.into()),
    _ => Ok(true),
  }
}

pub fn handle(
  ctx: Context<UpdateInstructionAccount>,
  arguments: UpdateInstructionAccountArguments,
) -> ProgramResult {
  msg!("Update instruction account");
  ctx.accounts.account.rename(arguments.name);
  ctx.accounts.account.change_settings(
    get_account_kind(
      arguments.kind,
      get_account_key(get_remaining_account::<Collection>(
        ctx.remaining_accounts,
        0,
      )?)?,
    )?,
    get_account_modifier(
      arguments.modifier,
      arguments.space,
      get_account_key(get_remaining_account::<InstructionAccount>(
        ctx.remaining_accounts,
        1,
      )?)?,
      get_account_key(get_remaining_account::<InstructionAccount>(
        ctx.remaining_accounts,
        1,
      )?)?,
    )?,
  );
  ctx.accounts.account.bump_timestamp()?;
  Ok(())
}
