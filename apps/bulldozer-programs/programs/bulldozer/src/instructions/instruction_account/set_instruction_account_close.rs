use crate::collections::{Instruction, InstructionAccount, InstructionAccountClose};
use crate::enums::AccountModifiers;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;

#[derive(Accounts)]
pub struct SetInstructionAccountClose<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace,
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
    constraint = close.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
    constraint = close.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
  )]
  pub close: Box<Account<'info, InstructionAccount>>,
  #[account(
    constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
    constraint = account.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
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
      bump = user.bump,
      seeds::program = user_manager_program.key()
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
