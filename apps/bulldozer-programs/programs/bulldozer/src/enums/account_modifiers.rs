use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountModifiers {
  Init { id: u8 },
  Mut { id: u8 },
}
