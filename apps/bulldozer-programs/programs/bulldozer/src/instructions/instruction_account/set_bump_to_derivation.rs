use crate::collections::{
  Application, Collaborator, Collection, CollectionAttribute, Instruction, InstructionAccount,
  InstructionAccountDerivation, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetBumpToDerivation<'info> {
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
    constraint = path.workspace == workspace.key() @ ErrorCode::CollectionAttributeDoesNotBelongToWorkspace,
    constraint = path.application == application.key() @ ErrorCode::CollectionAttributeDoesNotBelongToApplication,
    constraint = path.collection == collection.key() @ ErrorCode::CollectionAttributeDoesNotBelongToCollection,
  )]
  pub path: Box<Account<'info, CollectionAttribute>>,
  #[account(
    constraint = reference.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
    constraint = reference.application == application.key() @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    constraint = reference.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
  )]
  pub reference: Box<Account<'info, InstructionAccount>>,
  #[account(
    mut,
    seeds = [
      b"instruction_account_derivation".as_ref(),
      account.key().as_ref(),
    ],
    bump = account.bumps.derivation
  )]
  pub account_derivation: Box<Account<'info, InstructionAccountDerivation>>,
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

pub fn handle(ctx: Context<SetBumpToDerivation>) -> Result<()> {
  msg!("Set bump to derivation");
  ctx
    .accounts
    .account_derivation
    .set_bump(ctx.accounts.reference.key(), ctx.accounts.path.key());
  Ok(())
}
