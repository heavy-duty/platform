use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountKind {
  Document { id: u8 },
  Signer { id: u8 },
}

impl AccountKind {
  pub fn from_index(index: u8) -> Result<Self, ErrorCode> {
    match index {
      0 => Ok(AccountKind::Document { id: 0 }),
      1 => Ok(AccountKind::Signer { id: 1 }),
      _ => Err(ErrorCode::InvalidAccountKind.into()),
    }
  }
}
