use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKinds {
  Boolean { id: u8, size: u32 },
  Number { id: u8, size: u32 },
  String { id: u8, size: u32 },
  Pubkey { id: u8, size: u32 },
}

impl AttributeKinds {
  pub fn create(kind: u8, max: Option<u32>, max_length: Option<u32>) -> Result<AttributeKinds> {
    match (kind, max, max_length) {
      (0, _, _) => Ok(AttributeKinds::Boolean { id: 0, size: 1 }),
      (1, Some(max), _) => Ok(AttributeKinds::Number { id: 1, size: max }),
      (2, _, Some(max_length)) => Ok(AttributeKinds::String {
        id: 2,
        size: max_length,
      }),
      (3, _, _) => Ok(AttributeKinds::Pubkey { id: kind, size: 32 }),
      _ => Err(error!(ErrorCode::InvalidAttributeKind)),
    }
  }
}
