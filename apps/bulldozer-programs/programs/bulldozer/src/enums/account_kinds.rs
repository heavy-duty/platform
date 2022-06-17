use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountKinds {
  Document { id: u8 },
  Signer { id: u8 },
  Unchecked { id: u8 },
  Mint { id: u8 },
  Token { id: u8 },
}

impl AccountKinds {
  pub fn create(kind: u8) -> Result<AccountKinds> {
    match kind {
      0 => Ok(AccountKinds::Document { id: 0 }),
      1 => Ok(AccountKinds::Signer { id: 1 }),
      2 => Ok(AccountKinds::Unchecked { id: 2 }),
      3 => Ok(AccountKinds::Mint { id: 3 }),
      4 => Ok(AccountKinds::Token { id: 4 }),
      _ => Err(error!(ErrorCode::InvalidAccountKind)),
    }
  }
}
