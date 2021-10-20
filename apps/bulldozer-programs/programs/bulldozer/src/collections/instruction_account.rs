use crate::collections::Collection;
use crate::enums::{AccountKinds, AccountModifiers};
use crate::errors::ErrorCode;
use crate::utils::get_remaining_account;
use anchor_lang::prelude::*;

pub trait AccountKind {
  fn set_kind(&mut self, kind: Option<u8>) -> Result<&Self, ProgramError>;
}

pub trait AccountModifier {
  fn set_modifier(&mut self, modifier: Option<u8>) -> Result<&Self, ProgramError>;
}

pub trait AccountPayer {
  fn set_payer<'info>(
    &mut self,
    modifier: Option<u8>,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<&Self, ProgramError>;
}

pub trait AccountClose {
  fn set_close<'info>(
    &mut self,
    modifier: Option<u8>,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<&Self, ProgramError>;
}

pub trait AccountSpace {
  fn set_space<'info>(
    &mut self,
    modifier: Option<u8>,
    space: Option<u16>,
  ) -> Result<&Self, ProgramError>;
}

pub trait AccountCollection {
  fn set_collection<'info>(
    &mut self,
    modifier: Option<u8>,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<&Self, ProgramError>;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AccountDto {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub space: Option<u16>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BaseAccount {
  pub name: Vec<u8>,
  pub kind: Option<AccountKinds>,
  pub modifier: Option<AccountModifiers>,
  pub collection: Option<Pubkey>,
  pub payer: Option<Pubkey>,
  pub close: Option<Pubkey>,
  pub space: Option<u16>,
}

impl AccountKind for BaseAccount {
  fn set_kind<'info>(&mut self, kind: Option<u8>) -> Result<&Self, ProgramError> {
    self.kind = match kind {
      Some(0) => Some(AccountKinds::Document { id: 0 }),
      Some(1) => Some(AccountKinds::Signer { id: 1 }),
      _ => return Err(ErrorCode::InvalidAccountKind.into()),
    };

    Ok(self)
  }
}

impl AccountModifier for BaseAccount {
  fn set_modifier<'info>(&mut self, modifier: Option<u8>) -> Result<&Self, ProgramError> {
    self.modifier = match modifier {
      Some(0) => Some(AccountModifiers::Init { id: 0 }),
      Some(1) => Some(AccountModifiers::Mut { id: 1 }),
      None => None,
      _ => return Err(ErrorCode::InvalidAccountModifier.into()),
    };

    Ok(self)
  }
}

impl AccountPayer for BaseAccount {
  fn set_payer<'info>(
    &mut self,
    modifier: Option<u8>,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<&Self, ProgramError> {
    self.payer = match modifier {
      Some(0) => match get_remaining_account::<InstructionAccount>(remaining_accounts, 1)? {
        Some(payer) => Some(payer.key()),
        _ => return Err(ErrorCode::MissingPayerAccount.into()),
      },
      _ => None,
    };

    Ok(self)
  }
}

impl AccountClose for BaseAccount {
  fn set_close<'info>(
    &mut self,
    modifier: Option<u8>,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<&Self, ProgramError> {
    self.close = match modifier {
      Some(1) => match get_remaining_account::<InstructionAccount>(remaining_accounts, 1)? {
        Some(close) => Some(close.key()),
        _ => None,
      },
      _ => None,
    };

    Ok(self)
  }
}

impl AccountSpace for BaseAccount {
  fn set_space<'info>(
    &mut self,
    modifier: Option<u8>,
    space: Option<u16>,
  ) -> Result<&Self, ProgramError> {
    self.space = match modifier {
      Some(0) => match space {
        Some(space) => Some(space),
        _ => return Err(ErrorCode::MissingSpace.into()),
      },
      _ => None,
    };

    Ok(self)
  }
}

impl AccountCollection for BaseAccount {
  fn set_collection<'info>(
    &mut self,
    kind: Option<u8>,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<&Self, ProgramError> {
    self.collection = match kind {
      Some(0) => match get_remaining_account::<Collection>(remaining_accounts, 0)? {
        Some(collection) => Some(collection.key()),
        _ => return Err(ErrorCode::MissingCollectionAccount.into()),
      },
      _ => None,
    };

    Ok(self)
  }
}

#[account]
pub struct InstructionAccount {
  pub authority: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub data: BaseAccount,
}
