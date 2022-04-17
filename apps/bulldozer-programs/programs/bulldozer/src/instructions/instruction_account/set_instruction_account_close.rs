use crate::collections::{
  Application, Collaborator, InstructionAccount, InstructionAccountClose, User, Workspace,
};
use crate::enums::{AccountModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetInstructionAccountClose<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
        constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace,
    )]
  pub application: Box<Account<'info, Application>>,
  #[account(
      constraint = close.instruction == account.instruction @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
    )]
  pub close: Box<Account<'info, InstructionAccount>>,
  #[account(
      constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
      constraint = account.application == application.key() @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    )]
  pub account: Box<Account<'info, InstructionAccount>>,
  #[account(
        mut,
        seeds = [
          b"instruction_account_close".as_ref(),
          account.key().as_ref(),
        ],
        bump = account.bumps.close
    )]
  pub account_close: Box<Account<'info, InstructionAccountClose>>,
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

pub fn validate(ctx: &Context<SetInstructionAccountClose>) -> Result<bool> {
  match ctx.accounts.account.modifier {
    Some(AccountModifiers::Mut { id: 1 }) => Ok(true),
    _ => Err(error!(ErrorCode::OnlyMutAccountsCanHaveClose)),
  }
}

pub fn handle(ctx: Context<SetInstructionAccountClose>) -> Result<()> {
  msg!("Set instruction account close");
  ctx
    .accounts
    .account_close
    .set(Some(ctx.accounts.close.key()));
  Ok(())
}
