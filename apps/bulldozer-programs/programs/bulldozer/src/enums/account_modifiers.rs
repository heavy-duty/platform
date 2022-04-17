use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountModifiers {
  Init { id: u8 },
  Mut { id: u8 },
}

impl AccountModifiers {
  pub fn create(modifier: Option<u8>) -> Result<Option<AccountModifiers>> {
    match modifier {
      Some(0) => Ok(Some(AccountModifiers::Init { id: 0 })),
      Some(1) => Ok(Some(AccountModifiers::Mut { id: 1 })),
      None => Ok(None),
      _ => Err(error!(ErrorCode::InvalidAccountModifier)),
    }
  }
}
