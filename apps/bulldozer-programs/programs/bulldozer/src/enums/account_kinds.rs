use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountKinds {
  Document { id: u8, collection: Pubkey },
  Signer { id: u8 },
}

pub fn get_account_kind(
  kind: u8,
  collection: Option<Pubkey>,
) -> std::result::Result<AccountKinds, ProgramError> {
  match (kind, collection) {
    (0, Some(collection)) => Ok(AccountKinds::Document { id: 0, collection: collection }),
    (1, _) => Ok(AccountKinds::Signer {
      id: 1,
    }),
    _ => Err(ErrorCode::InvalidAccountKind.into())
  }
}
