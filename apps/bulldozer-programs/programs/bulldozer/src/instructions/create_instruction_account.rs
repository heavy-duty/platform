use crate::collections::{Application, Collection, Instruction, InstructionAccount};
use crate::enums::{AccountKind, AccountModifier};
use crate::errors::ErrorCode;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, space: Option<u16>, program: Option<Pubkey>)]
pub struct CreateInstructionAccount<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2 + 33 + 33 + 33 + 3
    )]
  pub account: Box<Account<'info, InstructionAccount>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(
  ctx: Context<CreateInstructionAccount>,
  name: String,
  kind: u8,
  modifier: u8,
  space: Option<u16>,
  program: Option<Pubkey>,
) -> ProgramResult {
  msg!("Create instruction account");
  ctx.accounts.account.authority = ctx.accounts.authority.key();
  ctx.accounts.account.application = ctx.accounts.application.key();
  ctx.accounts.account.instruction = ctx.accounts.instruction.key();
  ctx.accounts.account.name = vectorize_string(name, 32);
  ctx.accounts.account.kind = AccountKind::from_index(kind)?;
  ctx.accounts.account.modifier = AccountModifier::from_index(modifier)?;
  ctx.accounts.account.program = program;

  if kind == 0 {
    let collection = get_collection_account(ctx.remaining_accounts)?;
    ctx.accounts.account.collection = Some(collection.key());
  } else if kind == 1 {
    ctx.accounts.account.collection = None;
    ctx.accounts.account.program = match program {
      None => return Err(ErrorCode::MissingProgram.into()),
      program => program,
    }
  } else {
    ctx.accounts.account.collection = None;
  }

  if modifier == 1 {
    let payer = get_payer_account(ctx.remaining_accounts)?;
    ctx.accounts.account.payer = Some(payer.key());

    // make sure space was provided
    let space: u16 = match space {
      Some(space) => space,
      None => return Err(ErrorCode::MissingSpace.into()),
    };
    ctx.accounts.account.space = Some(space);
    ctx.accounts.account.close = None;
  } else if modifier == 2 {
    let close = get_close_account(ctx.remaining_accounts)?;
    ctx.accounts.account.close = match close {
      Some(account) => Some(account.key()),
      _ => None,
    };

    ctx.accounts.account.payer = None;
    ctx.accounts.account.space = None;
  } else {
    ctx.accounts.account.payer = None;
    ctx.accounts.account.space = None;
    ctx.accounts.account.close = None;
  }

  Ok(())
}

type MaybeCollectionAccount<'info> = std::result::Result<Account<'info, Collection>, ProgramError>;

fn get_collection_account<'info>(
  remaining_accounts: &[AccountInfo<'info>],
) -> MaybeCollectionAccount<'info> {
  let maybe_account: Option<&AccountInfo> = remaining_accounts.get(0);
  let maybe_decoded_account: Option<MaybeCollectionAccount<'info>> =
    maybe_account.map(Account::try_from);
  match maybe_decoded_account {
    Some(Err(_)) => return Err(ErrorCode::InvalidCollectionAccount.into()),
    None => return Err(ErrorCode::MissingCollectionAccount.into()),
    Some(account) => account,
  }
}

type MaybeInstructionAccount<'info> =
  std::result::Result<Account<'info, InstructionAccount>, ProgramError>;

fn get_payer_account<'info>(
  remaining_accounts: &[AccountInfo<'info>],
) -> MaybeInstructionAccount<'info> {
  let maybe_account: Option<&AccountInfo> = remaining_accounts.get(1);
  let maybe_decoded_account: Option<MaybeInstructionAccount<'info>> =
    maybe_account.map(Account::try_from);
  match maybe_decoded_account {
    Some(Err(_)) => return Err(ErrorCode::InvalidPayerAccount.into()),
    None => return Err(ErrorCode::MissingPayerAccount.into()),
    Some(account) => account,
  }
}

type MaybeCloseAccount<'info> =
  std::result::Result<Option<Account<'info, InstructionAccount>>, ProgramError>;

fn get_close_account<'info>(remaining_accounts: &[AccountInfo<'info>]) -> MaybeCloseAccount<'info> {
  let maybe_account: Option<&AccountInfo> = remaining_accounts.get(1);
  let maybe_decoded_account: Option<MaybeInstructionAccount<'info>> =
    maybe_account.map(Account::try_from);
  match maybe_decoded_account {
    Some(Ok(account)) => Ok(Some(account)),
    Some(Err(_)) => return Err(ErrorCode::InvalidCloseAccount.into()),
    None => Ok(None),
  }
}
