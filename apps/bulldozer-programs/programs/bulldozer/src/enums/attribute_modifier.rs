use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKindModifier {
  Array { id: u8, size: u32 },
  Vector { id: u8, size: u32 },
}

impl AttributeKindModifier {
  pub fn from_index(index: u8, size: u32) -> Result<Self, ErrorCode> {
    match index {
      0 => Ok(AttributeKindModifier::Array { id: 0, size: size }),
      1 => Ok(AttributeKindModifier::Vector { id: 1, size: size }),
      _ => Err(ErrorCode::InvalidAttributeModifier.into()),
    }
  }
}
