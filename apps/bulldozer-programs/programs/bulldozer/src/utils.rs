use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

pub fn get_remaining_account<'info, T: AccountSerialize + AccountDeserialize + Owner + Clone>(
  remaining_accounts: &[AccountInfo<'info>],
  index: usize,
) -> std::result::Result<Option<Account<'info, T>>, ProgramError> {
  let maybe_account: Option<&AccountInfo> = remaining_accounts.get(index);
  let maybe_decoded_account: Option<std::result::Result<Account<'info, T>, ProgramError>> =
    maybe_account.map(Account::try_from);
  match maybe_decoded_account {
    Some(Ok(account)) => Ok(Some(account)),
    Some(Err(_)) => return Err(ErrorCode::InvalidAccount.into()),
    None => Ok(None),
  }
}

pub fn get_account_key<'info, T: AccountSerialize + AccountDeserialize + Owner + Clone>(
  maybe_account: Option<Account<'info, T>>,
) -> std::result::Result<Option<Pubkey>, ProgramError> {
  match maybe_account {
    Some(account) => Ok(Some(account.key())),
    _ => Ok(None)
  }
}
