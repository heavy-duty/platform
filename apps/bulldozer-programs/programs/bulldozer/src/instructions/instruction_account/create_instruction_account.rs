use crate::collections::{
  Application, Instruction, InstructionAccount, Workspace,
  Collection
};
use anchor_lang::prelude::*;
use crate::enums::{get_account_kind, get_account_modifier};
use crate::utils::{get_remaining_account, get_account_key};
use crate::errors::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionAccountArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub space: Option<u16>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionAccountArguments)]
pub struct CreateInstructionAccount<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + application
        // instruction + name (size 32 + 4 ?) + kind + modifier
        // collection + payer + close + space + quantity of relations
        space = 8 + 32 + 32 + 32 + 32 + 36 + 2 + 2 + 33 + 33 + 33 + 3 + 1
    )]
  pub account: Box<Account<'info, InstructionAccount>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn validate(ctx: &Context<CreateInstructionAccount>, arguments: &CreateInstructionAccountArguments) -> std::result::Result<bool, ProgramError> {
  match (
    arguments.kind,
    get_remaining_account::<Collection>(ctx.remaining_accounts, 0)?,
    arguments.modifier,
    arguments.space,
    get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?
  ) {
    (0, None, _, _, _) => Err(ErrorCode::MissingCollectionAccount.into()),
    (_, _, Some(0), None, _) => Err(ErrorCode::MissingSpace.into()),
    (_, _, Some(0), _, None) => Err(ErrorCode::MissingPayerAccount.into()),
    _ => Ok(true)
  }
}

pub fn handler(ctx: Context<CreateInstructionAccount>, arguments: CreateInstructionAccountArguments) -> ProgramResult {
  msg!("Create instruction account");
  ctx.accounts.account.authority = ctx.accounts.authority.key();
  ctx.accounts.account.workspace = ctx.accounts.workspace.key();
  ctx.accounts.account.application = ctx.accounts.application.key();
  ctx.accounts.account.instruction = ctx.accounts.instruction.key();
  ctx.accounts.account.name = arguments.name;
  ctx.accounts.account.kind = get_account_kind(
    arguments.kind,
    get_account_key(
      get_remaining_account::<Collection>(ctx.remaining_accounts, 0)?
    )?
  )?;
  ctx.accounts.account.modifier = get_account_modifier(
    arguments.modifier,
    arguments.space,
    get_account_key(
      get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?
    )?,
    get_account_key(
      get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?
    )?
  )?;
  ctx.accounts.account.quantity_of_relations = 0;
  ctx.accounts.instruction.quantity_of_accounts += 1;
  Ok(())
}
