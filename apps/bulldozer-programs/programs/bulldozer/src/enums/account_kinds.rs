use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountKinds {
  Document { id: u8 },
  Signer { id: u8 },
}
