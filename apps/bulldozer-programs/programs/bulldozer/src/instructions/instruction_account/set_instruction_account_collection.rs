use crate::collections::{
  Application, Collection, Instruction, InstructionAccount, InstructionAccountCollection,
};
use crate::enums::AccountKinds;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;

#[derive(Accounts)]
pub struct SetInstructionAccountCollection<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
        constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace,
    )]
  pub application: Box<Account<'info, Application>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace,
    constraint = instruction.application == application.key() @ ErrorCode::InstructionDoesNotBelongToApplication,
)]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
        constraint = collection.workspace == workspace.key() @ ErrorCode::CollectionDoesNotBelongToWorkspace,
        constraint = collection.application == application.key() @ ErrorCode::CollectionDoesNotBelongToApplication,
    )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
      constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
      constraint = account.application == application.key() @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
      constraint = account.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
    )]
  pub account: Box<Account<'info, InstructionAccount>>,
  #[account(
        mut,
        seeds = [
          b"instruction_account_collection".as_ref(),
          account.key().as_ref(),
        ],
        bump = account.bumps.collection
    )]
  pub account_collection: Box<Account<'info, InstructionAccountCollection>>,
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

pub fn validate(ctx: &Context<SetInstructionAccountCollection>) -> Result<bool> {
  match ctx.accounts.account.kind {
    AccountKinds::Document { id: 0 } => Ok(true),
    _ => Err(error!(ErrorCode::OnlyDocumentAccountsCanHaveCollection)),
  }
}

pub fn handle(ctx: Context<SetInstructionAccountCollection>) -> Result<()> {
  msg!("Set instruction account collection");
  ctx
    .accounts
    .account_collection
    .set(Some(ctx.accounts.collection.key()));
  Ok(())
}
