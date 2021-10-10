use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountKind {
  Basic { id: u8 },
  Program { id: u8 },
  Signer { id: u8 },
}

impl AccountKind {
  pub fn from_index(index: u8) -> Result<Self, ErrorCode> {
    match index {
      0 => Ok(AccountKind::Basic { id: 0 }),
      1 => Ok(AccountKind::Program { id: 1 }),
      2 => Ok(AccountKind::Signer { id: 2 }),
      _ => Err(ErrorCode::InvalidAccountKind.into()),
    }
  }
}
