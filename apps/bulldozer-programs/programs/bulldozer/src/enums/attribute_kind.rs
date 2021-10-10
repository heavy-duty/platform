use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKind {
  U8 { id: u8, size: u8 },
  U16 { id: u8, size: u8 },
  U32 { id: u8, size: u8 },
  U64 { id: u8, size: u8 },
  U128 { id: u8, size: u8 },
  Pubkey { id: u8, size: u8 },
}

impl AttributeKind {
  pub fn from_index(index: u8) -> Result<Self, ErrorCode> {
    match index {
      0 => Ok(AttributeKind::U8 { id: 0, size: 1 }),
      1 => Ok(AttributeKind::U16 { id: 1, size: 2 }),
      2 => Ok(AttributeKind::U32 { id: 2, size: 4 }),
      3 => Ok(AttributeKind::U64 { id: 3, size: 8 }),
      4 => Ok(AttributeKind::U128 { id: 4, size: 16 }),
      5 => Ok(AttributeKind::Pubkey { id: 5, size: 32 }),
      _ => Err(ErrorCode::InvalidAttributeKind.into()),
    }
  }
}
