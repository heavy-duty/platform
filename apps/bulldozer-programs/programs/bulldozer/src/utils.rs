use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

pub fn vectorize_string(string: String, length: usize) -> Vec<u8> {
  let mut vector = Vec::new();

  for (i, letter) in string.as_bytes().iter().enumerate() {
    vector.push(*letter);

    if i == length - 1 {
      return vector;
    }
  }

  return vector;
}

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
