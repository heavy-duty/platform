use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountModifier {
  None { id: u8 },
  Init { id: u8 },
  Mut { id: u8 },
  Zero { id: u8 },
}

impl AccountModifier {
  pub fn from_index(index: u8) -> Result<Self, ErrorCode> {
    match index {
      0 => Ok(AccountModifier::None { id: 0 }),
      1 => Ok(AccountModifier::Init { id: 1 }),
      2 => Ok(AccountModifier::Mut { id: 2 }),
      3 => Ok(AccountModifier::Zero { id: 3 }),
      _ => Err(ErrorCode::InvalidAccountModifier.into()),
    }
  }
}
