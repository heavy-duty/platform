use anchor_lang::prelude::*;
use crate::errors::{ErrorCode};

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum MarkAttribute {
    None {
        id: u8
    },
    Init {
        id: u8
    },
    Mut {
        id: u8
    },
    Zero {
        id: u8
    },
}

impl MarkAttribute {
    pub fn from_index(index: u8) -> Result<Self, ErrorCode> {
        match index {
            0 => Ok(MarkAttribute::None{ id: 0 }),
            1 => Ok(MarkAttribute::Init{ id: 1 }),
            2 => Ok(MarkAttribute::Mut{ id: 2 }),
            3 => Ok(MarkAttribute::Zero{ id: 3 }),
            _ => Err(ErrorCode::InvalidMarkAttribute.into()),
        }
    }
}
