use crate::collections::Collection;
use crate::enums::{AccountKind, AccountModifier};
use crate::errors::ErrorCode;
use crate::utils::get_remaining_account;
use anchor_lang::prelude::*;

#[account]
pub struct InstructionAccount {
  pub authority: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub name: Vec<u8>,
  pub kind: AccountKind,
  pub modifier: AccountModifier,
  pub collection: Option<Pubkey>,
  pub payer: Option<Pubkey>,
  pub close: Option<Pubkey>,
  pub space: Option<u16>,
}

impl InstructionAccount {
  pub fn set_kind<'info>(
    &mut self,
    kind: u8,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<&Self, ProgramError> {
    self.kind = AccountKind::from_index(kind)?;

    if kind == 0 {
      self.collection = match get_remaining_account::<Collection>(remaining_accounts, 0)? {
        Some(collection) => Some(collection.key()),
        _ => return Err(ErrorCode::MissingCollectionAccount.into()),
      };
    } else {
      self.collection = None;
    };

    Ok(self)
  }

  pub fn set_modifier<'info>(
    &mut self,
    modifier: u8,
    remaining_accounts: &[AccountInfo<'info>],
    space: Option<u16>,
  ) -> Result<&Self, ProgramError> {
    self.modifier = AccountModifier::from_index(modifier)?;

    if modifier == 1 {
      self.payer = match get_remaining_account::<InstructionAccount>(remaining_accounts, 1)? {
        Some(payer) => Some(payer.key()),
        _ => return Err(ErrorCode::MissingPayerAccount.into()),
      };
      self.space = match space {
        Some(space) => Some(space),
        _ => return Err(ErrorCode::MissingSpace.into()),
      };
      self.close = None;
    } else if modifier == 2 {
      self.payer = None;
      self.space = None;
      self.close = match get_remaining_account::<InstructionAccount>(remaining_accounts, 1)? {
        Some(account) => Some(account.key()),
        _ => None,
      };
    } else {
      self.payer = None;
      self.space = None;
      self.close = None;
    }

    Ok(self)
  }
}
