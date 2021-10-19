use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKind {
  Number { id: u8, size: u32 },
  String { id: u8, size: u32 },
  Pubkey { id: u8, size: u32 },
}

impl AttributeKind {
  pub fn from_index(index: u8, size: u32) -> Result<Self, ErrorCode> {
    match index {
      0 => Ok(AttributeKind::Number { id: 0, size: size }),
      1 => Ok(AttributeKind::String { id: 1, size: size }),
      2 => Ok(AttributeKind::Pubkey { id: 2, size: size }),
      _ => Err(ErrorCode::InvalidAttributeKind.into()),
    }
  }
}
