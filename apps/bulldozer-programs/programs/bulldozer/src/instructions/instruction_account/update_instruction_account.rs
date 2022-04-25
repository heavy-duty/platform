use crate::collections::{
  Collaborator, Instruction, InstructionAccount, InstructionAccountClose, InstructionAccountPayer,
  User, Workspace,
};
use crate::enums::{AccountModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionAccountArguments {
  pub name: String,
  pub modifier: Option<u8>,
  pub space: Option<u16>,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionAccountArguments)]
pub struct UpdateInstructionAccount<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace,
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
    mut,
    constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
    constraint = account.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
  )]
  pub account: Box<Account<'info, InstructionAccount>>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"instruction_account_payer".as_ref(),
      account.key().as_ref(),
    ],
    bump = account.bumps.payer
  )]
  pub account_payer: Box<Account<'info, InstructionAccountPayer>>,
  #[account(
    mut,
    seeds = [
      b"instruction_account_close".as_ref(),
      account.key().as_ref(),
    ],
    bump = account.bumps.close
  )]
  pub account_close: Box<Account<'info, InstructionAccountClose>>,
}

pub fn validate(arguments: &UpdateInstructionAccountArguments) -> Result<bool> {
  match (arguments.modifier, arguments.space) {
    (Some(0), None) => Err(error!(ErrorCode::MissingSpace)),
    _ => Ok(true),
  }
}

pub fn handle(
  ctx: Context<UpdateInstructionAccount>,
  arguments: UpdateInstructionAccountArguments,
) -> Result<()> {
  msg!("Update instruction account");
  ctx.accounts.account.rename(arguments.name);
  ctx
    .accounts
    .account
    .set_modifier(AccountModifiers::create(arguments.modifier)?);
  ctx.accounts.account.set_space(arguments.space);
  ctx.accounts.account.bump_timestamp()?;
  match (ctx.accounts.account_payer.payer, arguments.modifier) {
    (_, Some(0)) => {}
    _ => ctx.accounts.account_payer.set(None),
  };
  match (ctx.accounts.account_close.close, arguments.modifier) {
    (_, Some(1)) => {}
    _ => ctx.accounts.account_close.set(None),
  };
  Ok(())
}
