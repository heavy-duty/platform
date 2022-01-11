use crate::enums::{AttributeKinds, AttributeModifiers};
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

pub fn get_attribute_kind(
  kind: Option<u8>,
  max: Option<u32>,
  max_length: Option<u32>,
) -> Result<Option<AttributeKinds>, ProgramError> {
  match kind {
    Some(kind) => match kind {
      0 => return Ok(Some(AttributeKinds::Boolean { id: kind, size: 1 })),
      1 => match max {
        None => return Err(ErrorCode::MissingMax.into()),
        Some(max) => return Ok(Some(AttributeKinds::Number {
          id: kind,
          size: max,
        })),
      },
      2 => match max_length {
        None => return Err(ErrorCode::MissingMaxLength.into()),
        Some(max_length) => return Ok(Some(AttributeKinds::String {
          id: kind,
          size: max_length,
        })),
      },
      3 => return Ok(Some(AttributeKinds::Pubkey { id: kind, size: 32 })),
      _ => return Err(ErrorCode::InvalidAttributeKind.into()),
    },
    _ => return Ok(None),
  }
}

pub fn get_attribute_modifier(
  modifier: Option<u8>,
  size: Option<u32>
) -> Result<Option<AttributeModifiers>, ProgramError> {
  match (modifier, size) {
    (Some(modifier), Some(size)) => match modifier {
      0 => return Ok(Some(AttributeModifiers::Array {
        id: modifier,
        size: size,
      })),
      1 => return Ok(Some(AttributeModifiers::Vector {
        id: modifier,
        size: size,
      })),
      _ => return Err(ErrorCode::InvalidAttributeModifier.into()),
    },
    (_, _) => return Ok(None),
  }
}
