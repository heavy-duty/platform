use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeModifiers {
  Array { id: u8, size: u32 },
  Vector { id: u8, size: u32 },
}

impl AttributeModifiers {
  pub fn create(modifier: Option<u8>, size: Option<u32>) -> Result<Option<AttributeModifiers>> {
    match (modifier, size) {
      (Some(0), Some(size)) => Ok(Some(AttributeModifiers::Array { id: 0, size: size })),
      (Some(1), Some(size)) => Ok(Some(AttributeModifiers::Vector { id: 1, size: size })),
      (None, _) => Ok(None),
      _ => Err(error!(ErrorCode::InvalidAttributeModifier)),
    }
  }
}
