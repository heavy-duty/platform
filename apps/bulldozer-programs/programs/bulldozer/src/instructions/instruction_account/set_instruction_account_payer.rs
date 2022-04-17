use crate::collections::{
  Application, Collaborator, InstructionAccount, InstructionAccountPayer, User, Workspace,
};
use crate::enums::{AccountModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetInstructionAccountPayer<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
        constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace,
    )]
  pub application: Box<Account<'info, Application>>,
  #[account(
      constraint = payer.instruction == account.instruction @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
    )]
  pub payer: Box<Account<'info, InstructionAccount>>,
  #[account(
      constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
      constraint = account.application == application.key() @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    )]
  pub account: Box<Account<'info, InstructionAccount>>,
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
}

pub fn validate(ctx: &Context<SetInstructionAccountPayer>) -> Result<bool> {
  match ctx.accounts.account.modifier {
    Some(AccountModifiers::Init { id: 0 }) => Ok(true),
    _ => Err(error!(ErrorCode::OnlyInitAccountsCanHavePayer)),
  }
}

pub fn handle(ctx: Context<SetInstructionAccountPayer>) -> Result<()> {
  msg!("Set instruction account payer");
  ctx
    .accounts
    .account_payer
    .set(Some(ctx.accounts.payer.key()));
  Ok(())
}
