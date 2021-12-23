use crate::collections::Collection;
use crate::enums::{AccountKinds, AccountModifiers};
use crate::errors::ErrorCode;
use crate::utils::get_remaining_account;
use anchor_lang::prelude::*;

pub trait AccountCollection {
  fn set_collection<'info>(
    &mut self,
    collection: Option<Account<'info, Collection>>,
  ) -> Result<&Self, ProgramError>;
}

pub trait AccountPayer {
  fn set_payer<'info>(
    &mut self,
    payer: Option<Account<'info, InstructionAccount>>,
  ) -> Result<&Self, ProgramError>;
}

pub trait AccountClose {
  fn set_close<'info>(
    &mut self,
    close: Option<Account<'info, InstructionAccount>>,
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
  pub name: String,
  pub kind: Option<AccountKinds>,
  pub modifier: Option<AccountModifiers>,
  pub collection: Option<Pubkey>,
  pub payer: Option<Pubkey>,
  pub close: Option<Pubkey>,
  pub space: Option<u16>,
}

impl AccountCollection for BaseAccount {
  fn set_collection<'info>(
    &mut self,
    collection: Option<Account<'info, Collection>>,
  ) -> Result<&Self, ProgramError> {
    self.collection = match collection {
      Some(collection) => Some(collection.key()),
      _ => return Err(ErrorCode::MissingCollectionAccount.into()),
    };

    Ok(self)
  }
}

impl AccountPayer for BaseAccount {
  fn set_payer<'info>(
    &mut self,
    payer: Option<Account<'info, InstructionAccount>>,
  ) -> Result<&Self, ProgramError> {
    self.payer = match payer {
      Some(payer) => Some(payer.key()),
      _ => return Err(ErrorCode::MissingPayerAccount.into()),
    };

    Ok(self)
  }
}

impl AccountClose for BaseAccount {
  fn set_close<'info>(
    &mut self,
    close: Option<Account<'info, InstructionAccount>>,
  ) -> Result<&Self, ProgramError> {
    self.close = match close {
      Some(close) => Some(close.key()),
      _ => None,
    };

    Ok(self)
  }
}

impl BaseAccount {
  pub fn create<'info>(
    dto: AccountDto,
    remaining_accounts: &[AccountInfo<'info>],
  ) -> Result<Self, ProgramError> {
    let mut base_account = BaseAccount {
      name: dto.name,
      kind: None,
      modifier: None,
      collection: None,
      payer: None,
      close: None,
      space: None,
    };

    match dto.kind {
      0 => {
        base_account.kind = Some(AccountKinds::Document { id: 0 });
        base_account.set_collection(get_remaining_account(remaining_accounts, 0)?)?;
      }
      1 => {
        base_account.kind = Some(AccountKinds::Signer { id: 1 });
      }
      _ => return Err(ErrorCode::InvalidAccountKind.into()),
    };

    match dto.modifier {
      Some(0) => {
        base_account.modifier = Some(AccountModifiers::Init { id: 0 });
        base_account.space = match dto.space {
          Some(space) => Some(space),
          _ => return Err(ErrorCode::MissingSpace.into()),
        };
        base_account.set_payer(get_remaining_account(remaining_accounts, 1)?)?;
      }
      Some(1) => {
        base_account.modifier = Some(AccountModifiers::Mut { id: 1 });
        base_account.set_close(get_remaining_account(remaining_accounts, 1)?)?;
      }
      None => {
        base_account.modifier = None;
      }
      _ => return Err(ErrorCode::InvalidAccountModifier.into()),
    };

    Ok(base_account)
  }
}

#[account]
pub struct InstructionAccount {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub data: BaseAccount,
}
