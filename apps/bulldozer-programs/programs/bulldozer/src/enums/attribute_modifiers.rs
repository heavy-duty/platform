use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeModifiers {
  Array { id: u8, size: u32 },
  Vector { id: u8, size: u32 },
}
