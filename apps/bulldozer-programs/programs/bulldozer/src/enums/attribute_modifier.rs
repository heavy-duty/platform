use anchor_lang::prelude::*;
use crate::errors::{ErrorCode};


#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKindModifier {
    None {
      id: u8,
      size: u8
    },
    Array {
      id: u8,
      size: u8
    },
    Vector {
      id: u8,
      size: u8
    }
}

impl AttributeKindModifier {
    pub fn from_index(index: u8, size: u8) -> Result<Self, ErrorCode> {
        match index {
            0 => Ok(AttributeKindModifier::None { id: 0, size: 1 }),
            1 => Ok(AttributeKindModifier::Array { id: 1, size: size }),
            2 => Ok(AttributeKindModifier::Vector { id: 2, size: size }),
            _ => Err(ErrorCode::InvalidAttributeModifier.into()),
        }
    }
}
