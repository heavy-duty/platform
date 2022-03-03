use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountModifiers {
  Init {
    id: u8,
    space: Option<u16>,
    payer: Option<Pubkey>,
  },
  Mut {
    id: u8,
    close: Option<Pubkey>,
  },
}

impl AccountModifiers {
  pub fn create(
    modifier: Option<u8>,
    space: Option<u16>,
    payer: Option<Pubkey>,
    close: Option<Pubkey>,
  ) -> Result<Option<AccountModifiers>> {
    match (modifier, space, payer, close) {
      (Some(0), space, payer, _) => Ok(Some(AccountModifiers::Init {
        id: 0,
        space: space,
        payer: payer,
      })),
      (Some(1), _, _, close) => Ok(Some(AccountModifiers::Mut {
        id: 1,
        close: close,
      })),
      (None, _, _, _) => Ok(None),
      _ => Err(error!(ErrorCode::InvalidAccountModifier)),
    }
  }
}
