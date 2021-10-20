use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKinds {
  Number { id: u8, size: u32 },
  String { id: u8, size: u32 },
  Pubkey { id: u8, size: u32 },
}
