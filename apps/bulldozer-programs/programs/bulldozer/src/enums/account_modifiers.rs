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

pub fn get_account_modifier(
  modifier: Option<u8>,
  space: Option<u16>,
  payer: Option<Pubkey>,
  close: Option<Pubkey>,
) -> std::result::Result<Option<AccountModifiers>, ProgramError> {
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
    _ => Err(ErrorCode::InvalidAccountModifier.into()),
  }
}
