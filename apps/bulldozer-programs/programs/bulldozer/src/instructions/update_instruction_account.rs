use crate::collections::{Collection, InstructionAccount};
use crate::enums::{AccountKind, AccountModifier};
use crate::errors::ErrorCode;
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
  msg!("Create instruction basic account");
  ctx.accounts.account.name = vectorize_string(name, 32);
  ctx.accounts.account.kind = AccountKind::from_index(kind)?;
  ctx.accounts.account.modifier = AccountModifier::from_index(modifier)?;
  ctx.accounts.account.space = space;
  ctx.accounts.account.program = program;

  msg!("collection kind {}", kind);

  if kind == 0 {
    let collection = get_collection_account(ctx.remaining_accounts)?;
    ctx.accounts.account.collection = Some(collection.key());
    msg!("collection Id {}", collection.key().to_string());
  } else {
    ctx.accounts.account.collection = None;
  }

  Ok(())
}

type MaybeCollectionAccount<'info> = std::result::Result<Account<'info, Collection>, ProgramError>;

fn get_collection_account<'info>(
  remaining_accounts: &[AccountInfo<'info>],
) -> MaybeCollectionAccount<'info> {
  let maybe_account: Option<&AccountInfo> = remaining_accounts.get(0);
  let maybe_decoded_account: Option<MaybeCollectionAccount<'info>> =
    maybe_account.map(Account::try_from);
  match maybe_decoded_account {
    Some(Err(_)) => return Err(ErrorCode::InvalidCollectionAccount.into()),
    None => return Err(ErrorCode::MissingCollectionAccount.into()),
    Some(account) => account,
  }
}
